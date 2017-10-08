/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import isEqual from 'lodash.isequal';

import type {
  Auth,
  Narrow,
  EditMessage,
  InputSelectionType,
  User,
  Actions,
  Dimensions,
} from '../types';
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
import NotSubscribed from '../message/NotSubscribed';

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
  canSend: boolean,
  narrow: Narrow,
  users: User[],
  draft: string,
  composeTools: boolean,
  isSubscribed: boolean,
  editMessage: EditMessage,
  safeAreaInsets: Dimensions,
  actions: Actions,
  messageInputRef: (component: Object) => void,
  onSend: () => void,
};

export default class ComposeBox extends PureComponent {
  topicInput = null;
  messageInput = null;

  messageInput: TextInput;
  topicInput: TextInput;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  state: {
    topic: string,
    message: string,
    height: number,
    selection: InputSelectionType,
  };

  state = {
    height: 46,
    topic: '',
    message: '',
    selection: { start: 0, end: 0 },
  };

  handleTopicChange = (topic: string) => {
    this.setState({ topic });
  };

  handleMessageChange = (message: string) => {
    this.setState({ message });
    const { auth } = this.props;
    registerUserInputActivity(auth);
  };

  handleMessageSelectionChange = (event: Object) => {
    const { selection } = event.nativeEvent;
    this.setState({ selection });
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
    const { actions, narrow, onSend } = this.props;
    const { topic, message } = this.state;

    const topicToSend = replaceEmoticonsWithEmoji(topic);
    const messageToSend = replaceEmoticonsWithEmoji(message);
    const destinationNarrow = isStreamNarrow(narrow)
      ? topicNarrow(narrow[0].operand, topicToSend || '(no topic)')
      : narrow;

    actions.addToOutbox(destinationNarrow, messageToSend);

    this.clearMessageInput();
    onSend();
  };

  handleEdit = () => {
    const { auth, editMessage, actions } = this.props;
    const { message } = this.state;
    if (editMessage.content !== message) {
      patchMessage(auth, replaceEmoticonsWithEmoji(message), editMessage.id).catch(error =>
        showErrorAlert(error.message, 'Failed to edit message'),
      );
    }
    actions.cancelEditMessage();
  };

  handleAutoComplete = (input: string) => {
    this.setState({ message: input });
  };

  handleChangeText = (input: string) => {
    this.setState({ message: input });
  };

  tryUpdateDraft = () => {
    const { actions, draft, narrow } = this.props;
    const { message } = this.state;
    if (message !== '' && draft !== message) {
      actions.saveToDrafts(JSON.stringify(narrow), message);
    }
  };

  componentWillUnmount() {
    this.tryUpdateDraft();
  }

  componentWillMount() {
    const { draft } = this.props;
    if (draft) {
      this.setState({ message: draft });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.editMessage !== this.props.editMessage) {
      this.setState({
        message: nextProps.editMessage ? nextProps.editMessage.content : '',
      });
      this.messageInput.focus();
    } else if (!isEqual(nextProps.narrow, this.props.narrow)) {
      this.tryUpdateDraft();

      if (nextProps.draft) {
        this.setState({ message: nextProps.draft });
      } else {
        this.clearMessageInput();
      }
    }
  }

  render() {
    const { styles } = this.context;
    const { height, message, selection, topic } = this.state;
    const {
      auth,
      canSend,
      composeTools,
      narrow,
      users,
      editMessage,
      safeAreaInsets,
      messageInputRef,
      isSubscribed,
    } = this.props;

    if (!canSend) {
      return null;
    }

    if (!isSubscribed) {
      return <NotSubscribed />;
    }

    const canSelectTopic = composeTools && isStreamNarrow(narrow);
    const messageHeight = Math.min(Math.max(MIN_HEIGHT, height), MAX_HEIGHT);
    const totalHeight = canSelectTopic ? messageHeight + 30 : messageHeight;
    const placeholder = getComposeInputPlaceholder(narrow, auth.email, users);

    return (
      <View>
        <AutoCompleteView
          text={message}
          onAutocomplete={this.handleAutoComplete}
          selection={selection}
        />
        <View
          style={[styles.composeBox, { height: totalHeight, marginBottom: safeAreaInsets.bottom }]}
        >
          <View style={componentStyles.bottom}>
            <ComposeMenuContainer />
          </View>
          <View style={[componentStyles.composeText]}>
            {canSelectTopic && (
              <Input
                style={[styles.composeTextInput, componentStyles.topic]}
                underlineColorAndroid="transparent"
                placeholder="Topic"
                textInputRef={component => {
                  this.topicInput = component;
                }}
                onChangeText={this.handleTopicChange}
                value={topic}
              />
            )}
            <MultilineInput
              style={[styles.composeTextInput, { height: messageHeight }]}
              placeholder={placeholder}
              textInputRef={component => {
                this.messageInput = component;
                if (component) messageInputRef(component);
              }}
              onChange={this.handleMessageChange}
              onHeightChange={this.handleHeightChange}
              onSelectionChange={this.handleMessageSelectionChange}
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
