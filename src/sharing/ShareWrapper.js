/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { FlatList, ImageBackground, ScrollView, View, Text } from 'react-native';

import type { Auth, Dispatch, GetText, UserId } from '../types';
import type { SharedData, SharedFile } from './types';
import * as api from '../api';
import * as logging from '../utils/logging';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { Input, ZulipButton, ComponentWithOverlay } from '../common';
import { TranslationContext } from '../boot/TranslationProvider';
import * as NavigationService from '../nav/NavigationService';
import { navigateBack, replaceWithChat } from '../nav/navActions';
import { showToast } from '../utils/info';
import { getAuth, getOwnUserId } from '../selectors';
import { connect } from '../react-redux';
import { streamNarrow, pmNarrowFromRecipients } from '../utils/narrow';
import { pmKeyRecipientsFromIds } from '../utils/recipient';
import { ensureUnreachable } from '../generics';
import { IconAttachment, IconCancel } from '../common/Icons';

type SendTo =
  | {| type: 'pm', selectedRecipients: $ReadOnlyArray<UserId> |}
  | {| type: 'stream', stream: string, topic: string |};

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

type Props = $ReadOnly<{|
  children: Node,
  isSendButtonEnabled: (message: string) => boolean,
  sendTo: SendTo,
  sharedData: SharedData,

  dispatch: Dispatch,
  auth: Auth,
  ownUserId: UserId,
|}>;

type State = $ReadOnly<{|
  message: string,
  sending: boolean,
  files: SharedFile[],
|}>;

/**
 * Wraps Around different sharing screens,
 * for minimal duplication of code.
 */
class ShareWrapper extends React.Component<Props, State> {
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
    const { auth, sendTo, sharedData } = this.props;
    let messageToSend = this.state.message;

    this.setSending();
    showToast(_('Sending Message...'));
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
            subject: sendTo.topic,
            to: sendTo.stream,
          };

    try {
      await api.sendMessage(auth, messageData);
    } catch (err) {
      showToast(_('Failed to send message'));
      logging.error(err);
      this.onShareCancelled();
      return;
    }
    showToast(_('Message sent'));
    this.onShareSuccess();
  };

  onShareCancelled = () => {
    NavigationService.dispatch(navigateBack());
  };

  onShareSuccess = () => {
    const { sendTo } = this.props;
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
        const { stream } = sendTo;
        const narrow = streamNarrow(stream);
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
    this.setState(prevState => {
      const filteredItems = [...prevState.files].filter(item => item.url !== toDelete.url);
      if (prevState.files.length !== 0 && filteredItems.length === 0) {
        setTimeout(() => {
          showToast('Cancelled Share');
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
    const { children, isSendButtonEnabled, sharedData } = this.props;
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
            disabled={!isSendButtonEnabled(message)}
          />
        </View>
      </>
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
  ownUserId: getOwnUserId(state),
}))(ShareWrapper);
