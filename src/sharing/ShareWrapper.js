/* @flow strict-local */
import React from 'react';
import { BackHandler, Image, ScrollView, View } from 'react-native';

import type { Auth, Dispatch, GetText, SharedData, UserId } from '../types';
import * as api from '../api';
import * as logging from '../utils/logging';
import { createStyleSheet } from '../styles';
import { Input, ZulipButton } from '../common';
import { TranslationContext } from '../boot/TranslationProvider';
import * as NavigationService from '../nav/NavigationService';
import { navigateBack } from '../nav/navActions';
import { showToast } from '../utils/info';
import { getAuth } from '../selectors';
import { connect } from '../react-redux';

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
});

type SendStream = {|
  stream: string,
  topic: string,
  type: 'stream',
|};

type SendPm = {|
  selectedRecipients: $ReadOnlyArray<UserId>,
  type: 'pm',
|};

type Props = $ReadOnly<{|
  children: React$Node,
  isSendButtonEnabled: (message: string) => boolean,
  sendTo: SendStream | SendPm,
  sharedData: SharedData,

  dispatch: Dispatch,
  auth: Auth,
|}>;

type State = $ReadOnly<{|
  message: string,
  sending: boolean,
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
    if (sharedData.type === 'image' || sharedData.type === 'file') {
      const url =
        sharedData.type === 'image' ? sharedData.sharedImageUrl : sharedData.sharedFileUrl;
      const fileName = url.split('/').pop();
      const response = await api.uploadFile(auth, url, fileName);
      messageToSend += `\n[${fileName}](${response.uri})`;
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
      return;
    }
    showToast(_('Message sent'));
    this.finishShare();
  };

  finishShare = () => {
    NavigationService.dispatch(navigateBack());
    BackHandler.exitApp();
  };

  render() {
    const { children, isSendButtonEnabled, sharedData } = this.props;
    const { message, sending } = this.state;

    return (
      <>
        <ScrollView style={styles.wrapper} keyboardShouldPersistTaps="always" nestedScrollEnabled>
          <View style={styles.container}>
            {sharedData.type === 'image' && (
              <Image source={{ uri: sharedData.sharedImageUrl }} style={styles.imagePreview} />
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
          <ZulipButton onPress={this.finishShare} style={styles.button} secondary text="Cancel" />
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
}))(ShareWrapper);
