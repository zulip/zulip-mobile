/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Auth, Narrow, EditMessage, User, Actions } from '../types';
import patchMessage from '../api/updateMessage';
import { FloatingActionButton, Input, MultilineInput } from '../common';
import { showErrorAlert } from '../common/errorAlert';
import { IconDone, IconSend } from '../common/Icons';
import { isStreamNarrow, topicNarrow } from '../utils/narrow';
import ComposeMenuContainer from './ComposeMenuContainer';
import AutoCompleteView from '../autocomplete/AutoCompleteView';
import getComposeInputPlaceholder from './getComposeInputPlaceholder';
import { registerUserInputActivity } from '../utils/activity';
import { replaceEmoticonsWithEmoji } from '../emoji/emoticons';

const MIN_HEIGHT = 46;
const MAX_HEIGHT = 100;

const componentStyles = StyleSheet.create({
  bottom: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  composeText: {
    flex: 1,
    flexDirection: 'column',
  },
  topic: {
    height: 30,
    backgroundColor: 'rgba(127, 127, 127, 0.25)',
  },
  button: {
    margin: 5,
  },
});

type Props = {
  auth: Auth,
  narrow: Narrow,
  users: User[],
  composeTools: boolean,
  editMessage: EditMessage,
  actions: Actions,
};

export default class ComposeBox extends PureComponent {
  topicInput = null;
  messageInput = null;

  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  state: {
    optionSelected: number,
    topic: string,
    message: string,
    height: number,
  };

  state = {
    optionSelected: 0,
    height: 28,
    topic: '',
    message: '',
  };

  handleTopicChange = (topic: string) => {
    this.setState({ topic });
  };

  handleMessageChange = (message: string) => {
    this.setState({ message });
    const { auth } = this.props;
    registerUserInputActivity(auth);
  };

  handleHeightChange = (height: number) => {
    this.setState({ height });
  };

  clearMessageInput = () => {
    if (this.topicInput) {
      this.topicInput.clear();
    }
    if (this.messageInput) {
      this.messageInput.clear();
    }
    this.handleMessageChange('');
  };

  handleSend = () => {
    const { actions, narrow } = this.props;
    const { topic, message } = this.state;

    const topicToSend = replaceEmoticonsWithEmoji(topic);
    const messageToSend = replaceEmoticonsWithEmoji(message);
    if (isStreamNarrow(narrow)) {
      actions.addToOutbox(
        topicNarrow(narrow[0].operand, topicToSend === '' ? '(no topic)' : topicToSend),
        messageToSend,
      );
    } else {
      actions.addToOutbox(narrow, messageToSend);
    }

    this.clearMessageInput();
  };

  handleEdit = () => {
    const { auth, editMessage, actions } = this.props;
    const { message } = this.state;
    if (editMessage.content !== message) {
      try {
        patchMessage(auth, replaceEmoticonsWithEmoji(message), editMessage.id, (msg: string) =>
          showErrorAlert(msg, 'Failed to edit message'),
        );
      } catch (err) {
        showErrorAlert(err.message, 'Failed to edit message');
      }
    }
    actions.cancelEditMessage();
  };

  handleAutoComplete = (input: string) => {
    this.setState({ message: input });
  };

  handleChangeText = (input: string) => {
    this.setState({ message: input });
  };

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.editMessage !== this.props.editMessage) {
      this.setState({
        message: nextProps.editMessage ? nextProps.editMessage.content : '',
      });
      this.messageInput.focus();
    }
  }

  render() {
    const { styles } = this.context;
    const { height, message, topic } = this.state;
    const { auth, composeTools, narrow, users, editMessage } = this.props;

    const canSelectTopic = composeTools && isStreamNarrow(narrow);
    const messageHeight = Math.min(Math.max(MIN_HEIGHT, height + 10), MAX_HEIGHT);
    const totalHeight = canSelectTopic ? messageHeight + 30 : messageHeight;
    const placeholder = getComposeInputPlaceholder(narrow, auth.email, users);

    return (
      <View>
        <AutoCompleteView text={message} onAutocomplete={this.handleAutoComplete} />
        <View style={[styles.composeBox, { height: totalHeight }]}>
          <View style={componentStyles.bottom}>
            <ComposeMenuContainer />
          </View>
          <View style={[componentStyles.composeText]}>
            {canSelectTopic &&
              <Input
                style={[styles.composeTextInput, componentStyles.topic]}
                underlineColorAndroid="transparent"
                placeholder="Topic"
                textInputRef={component => {
                  this.topicInput = component;
                }}
                onChangeText={this.handleTopicChange}
                value={topic}
              />}
            <MultilineInput
              style={styles.composeTextInput}
              placeholder={placeholder}
              textInputRef={component => {
                this.messageInput = component;
              }}
              onChange={this.handleMessageChange}
              onHeightChange={this.handleHeightChange}
              value={message}
            />
          </View>
          <View style={componentStyles.bottom}>
            <FloatingActionButton
              style={componentStyles.button}
              Icon={editMessage === null ? IconSend : IconDone}
              size={32}
              disabled={message.length === 0}
              onPress={editMessage === null ? this.handleSend : this.handleEdit}
            />
          </View>
        </View>
      </View>
    );
  }
}
