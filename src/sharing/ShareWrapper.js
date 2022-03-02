/* @flow strict-local */
import React from 'react';
import type { Node, ComponentType } from 'react';
import { FlatList, ImageBackground, ScrollView, View, Text } from 'react-native';

import * as apiConstants from '../api/constants';
import type { Auth, Dispatch, GetText, UserId } from '../types';
import type { SharedData, SharedFile } from './types';
import * as api from '../api';
import * as logging from '../utils/logging';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import Input from '../common/Input';
import ZulipButton from '../common/ZulipButton';
import ComponentWithOverlay from '../common/ComponentWithOverlay';
import { TranslationContext } from '../boot/TranslationProvider';
import * as NavigationService from '../nav/NavigationService';
import { navigateBack, replaceWithChat } from '../nav/navActions';
import { showToast, showErrorAlert } from '../utils/info';
import { getAuth, getOwnUserId } from '../selectors';
import { connect } from '../react-redux';
import { streamNarrow, pmNarrowFromRecipients } from '../utils/narrow';
import { pmKeyRecipientsFromIds } from '../utils/recipient';
import { ensureUnreachable } from '../generics';
import { IconAttachment, IconCancel } from '../common/Icons';

type SendTo =
  | {| type: 'pm', selectedRecipients: $ReadOnlyArray<UserId> |}
  // TODO(server-2.0): Drop streamName (#3918).  Used below for sending.
  | {| type: 'stream', streamName: string, streamId: number, topic: string |};

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    padding: 10,
  },
  container: {
    flex: 1,
  },
  imagePreview: {
    margin: 10,
    borderRadius: 5,
    width: 200,
    height: 200,
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    margin: 8,
  },
  previewText: {
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#000000a0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

// TODO(?): Could deduplicate with this type in ComposeBox.
export type ValidationError =
  | 'mandatory-topic-empty'
  | 'stream-empty'
  | 'stream-invalid'
  | 'recipients-empty'
  | 'message-empty';

type OuterProps = $ReadOnly<{|
  children: Node,
  getValidationErrors: (message: string) => $ReadOnlyArray<ValidationError>,
  sendTo: SendTo,
  sharedData: SharedData,
|}>;

type SelectorProps = $ReadOnly<{|
  auth: Auth,
  ownUserId: UserId,
|}>;

type Props = $ReadOnly<{|
  ...OuterProps,

  ...SelectorProps,
  dispatch: Dispatch,
|}>;

type State = $ReadOnly<{|
  message: string,
  sending: boolean,
  files: $ReadOnlyArray<SharedFile>,
|}>;

/**
 * Wraps Around different sharing screens,
 * for minimal duplication of code.
 */
class ShareWrapperInner extends React.Component<Props, State> {
  static contextType = TranslationContext;
  context: GetText;

  state = (() => {
    const { sharedData } = this.props;
    return {
      message: sharedData.type === 'text' ? sharedData.sharedText : '',
      sending: false,
      files: sharedData.type === 'text' ? [] : sharedData.files,
    };
  })();

  handleMessageChange = (message: string) => {
    this.setState({ message });
  };

  setSending = () => {
    this.setState({ sending: true });
  };

  /**
   * Send received shared data as a message.
   *
   * Sends the shared data received from a 3rd party app and possibly modified
   * by the user, to the server, as a message.
   */
  handleSend = async () => {
    const _ = this.context;
    const { auth, sendTo, sharedData, getValidationErrors } = this.props;
    let messageToSend = this.state.message;

    const validationErrors = getValidationErrors(messageToSend);

    if (validationErrors.length > 0) {
      const msg = validationErrors
        .map(error => {
          switch (error) {
            case 'stream-empty':
              return _('Please specify a stream.');
            case 'stream-invalid':
              return _('Please specify a valid stream.');
            case 'mandatory-topic-empty':
              return _('Please specify a topic.');
            case 'recipients-empty':
              return _('Please choose recipients.');
            case 'message-empty':
              return _('Message is empty.');
            default:
              ensureUnreachable(error);
              throw new Error();
          }
        })
        .join('\n\n');

      showErrorAlert(_('Message not sent'), msg);
      return;
    }

    this.setSending();
    showToast(_('Sending message…'));
    if (sharedData.type === 'file') {
      const { files } = this.state;
      for (let i = 0; i < files.length; i++) {
        const response = await api.uploadFile(auth, files[i].url, files[i].name);
        messageToSend += `\n[${files[i].name}](${response.uri})\n`;
      }
    }
    const messageData =
      sendTo.type === 'pm'
        ? {
            content: messageToSend,
            type: 'private',
            to: JSON.stringify(sendTo.selectedRecipients),
          }
        : {
            content: messageToSend,
            type: 'stream',
            subject: sendTo.topic || apiConstants.NO_TOPIC_TOPIC,
            // TODO(server-2.0): switch to numeric stream ID (#3918), not name;
            //   then drop streamName from SendTo
            to: sendTo.streamName,
          };

    try {
      await api.sendMessage(auth, messageData);
    } catch (err) {
      showToast(_('Failed to send message'));
      logging.error(err);
      this.onShareCancelled(sendTo);
      return;
    }
    showToast(_('Message sent'));
    this.onShareSuccess(sendTo);
  };

  onShareCancelled = sendTo => {
    // If in the future this callback uses the `sendTo` data, it should get
    // it from its parameter (just like `onShareSuccess` does) and not from
    // the props.  That's because the props may have changed since the
    // actual send request we just made.
    NavigationService.dispatch(navigateBack());
  };

  onShareSuccess = sendTo => {
    switch (sendTo.type) {
      case 'pm': {
        const { selectedRecipients } = sendTo;
        const { ownUserId } = this.props;
        const recipients = pmKeyRecipientsFromIds(selectedRecipients, ownUserId);
        const narrow = pmNarrowFromRecipients(recipients);
        NavigationService.dispatch(replaceWithChat(narrow));
        break;
      }

      case 'stream': {
        const { streamId } = sendTo;
        const narrow = streamNarrow(streamId);
        NavigationService.dispatch(replaceWithChat(narrow));
        break;
      }

      default:
        ensureUnreachable(sendTo.type);
        logging.error('Unknown type encountered in `sendTo`.');
        this.onShareCancelled();
    }
  };

  deleteItem = toDelete => {
    const _ = this.context;
    this.setState(prevState => {
      const filteredItems = [...prevState.files].filter(item => item.url !== toDelete.url);
      if (prevState.files.length !== 0 && filteredItems.length === 0) {
        setTimeout(() => {
          showToast(_('Share canceled'));
          this.onShareCancelled();
        }, 0);
      }
      return { files: filteredItems };
    });
  };

  renderItem = ({ item, index, separators }) => (
    <ComponentWithOverlay
      overlaySize={24}
      overlayColor="white"
      overlayPosition="bottom-right"
      overlay={<IconCancel color="gray" size={24} onPress={() => this.deleteItem(item)} />}
    >
      {item.mimeType.startsWith('image/') ? (
        <ImageBackground source={{ uri: item.url }} style={styles.imagePreview}>
          <Text style={styles.previewText}>{item.name}</Text>
        </ImageBackground>
      ) : (
        <View style={styles.imagePreview}>
          <IconAttachment size={200} color={BRAND_COLOR} />
          <Text style={styles.previewText}>{item.name}</Text>
        </View>
      )}
    </ComponentWithOverlay>
  );

  render() {
    const { children, getValidationErrors, sharedData } = this.props;
    const { message, sending } = this.state;

    return (
      <>
        <ScrollView style={styles.wrapper} keyboardShouldPersistTaps="always" nestedScrollEnabled>
          <View style={styles.container}>
            {sharedData.type === 'file' && (
              <FlatList
                data={this.state.files}
                renderItem={this.renderItem}
                keyExtractor={i => i.url}
                horizontal
              />
            )}
          </View>
          {children}
          <Input
            value={message}
            placeholder="Message"
            onChangeText={this.handleMessageChange}
            multiline
          />
        </ScrollView>
        <View style={styles.actions}>
          <ZulipButton
            onPress={this.onShareCancelled}
            style={styles.button}
            secondary
            text="Cancel"
          />
          <ZulipButton
            style={styles.button}
            onPress={this.handleSend}
            text="Send"
            progress={sending}
            disabled={getValidationErrors(message).length > 0}
            isPressHandledWhenDisabled
          />
        </View>
      </>
    );
  }
}

const ShareWrapper: ComponentType<OuterProps> = connect(state => ({
  auth: getAuth(state),
  ownUserId: getOwnUserId(state),
}))(ShareWrapperInner);

export default ShareWrapper;
