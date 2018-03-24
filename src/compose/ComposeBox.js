/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, TextInput, findNodeHandle } from 'react-native';
import TextInputReset from 'react-native-text-input-reset';
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
import { updateMessage } from '../api';
import { FloatingActionButton, Input, MultilineInput } from '../common';
import { showErrorAlert } from '../utils/info';
import { IconDone, IconSend } from '../common/Icons';
import { isStreamNarrow, topicNarrow } from '../utils/narrow';
import ComposeMenuContainer from './ComposeMenuContainer';
import AutocompleteViewWrapper from '../autocomplete/AutocompleteViewWrapper';
import getComposeInputPlaceholder from './getComposeInputPlaceholder';
import { replaceEmoticonsWithEmoji } from '../emoji/emoticons';
import NotSubscribed from '../message/NotSubscribed';

const MIN_HEIGHT = 42;
const MAX_HEIGHT = 82;

const componentStyles = StyleSheet.create({
  bottom: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  composeText: {
    flex: 1,
    justifyContent: 'center',
  },
  topicInput: {
    borderColor: 'transparent',
    padding: 4,
    backgroundColor: 'rgba(127, 127, 127, 0.25)',
  },
  button: {
    margin: 6,
  },
});

type Props = {
  auth: Auth,
  canSend: boolean,
  narrow: Narrow,
  users: User[],
  draft: string,
  lastMessageTopic: string,
  isSubscribed: boolean,
  editMessage: EditMessage,
  safeAreaInsets: Dimensions,
  actions: Actions,
  messageInputRef: (component: any) => void,
  onSend: () => void,
};

type State = {
  isMessageFocused: boolean,
  isTopicFocused: boolean,
  isMenuExpanded: boolean,
  topic: string,
  message: string,
  height: number,
  selection: InputSelectionType,
};

export default class ComposeBox extends PureComponent<Props, State> {
  topicInput = null;
  messageInput = null;

  messageInput: TextInput;
  topicInput: TextInput;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  state: State;

  state = {
    isMessageFocused: false,
    isTopicFocused: false,
    isMenuExpanded: false,
    height: MIN_HEIGHT,
    topic: '',
    message: this.props.draft,
    selection: { start: 0, end: 0 },
  };

  handleComposeMenuToggle = () => {
    this.setState(({ isMenuExpanded }) => ({
      isMenuExpanded: !isMenuExpanded,
    }));
  };

  handleLayoutChange = (event: Object) => {
    this.setState({
      height: event.nativeEvent.layout.height,
    });
  };

  handleTopicChange = (topic: string) => {
    this.setState({ topic });
  };

  handleMessageChange = (message: string) => {
    this.setState({ message });
    const { actions, narrow } = this.props;
    actions.sendTypingEvent(narrow);
  };

  handleMessageSelectionChange = (event: Object) => {
    const { selection } = event.nativeEvent;
    this.setState({ selection });
  };

  handleMessageFocus = () => {
    const { lastMessageTopic } = this.props;
    this.setState(({ topic }) => ({
      isMessageFocused: true,
      isMenuExpanded: false,
      topic: topic || lastMessageTopic,
    }));
  };

  handleMessageBlur = () => {
    setTimeout(() => {
      this.setState({ isMessageFocused: false });
    }, 200); // give a chance to the topic input to get the focus
  };

  handleTopicFocus = () => {
    const { actions, narrow } = this.props;
    this.setState({
      isTopicFocused: true,
      isMenuExpanded: false,
    });
    actions.fetchTopicsForActiveStream(narrow);
  };

  handleTopicBlur = () => {
    setTimeout(() => {
      this.setState({ isTopicFocused: false });
    }, 200); // give a chance to the mesage input to get the focus
  };

  clearMessageInput = () => {
    if (this.messageInput) {
      this.messageInput.clear();
      if (TextInputReset) {
        TextInputReset.resetKeyboardInput(findNodeHandle(this.messageInput));
      }
    }

    this.handleMessageChange('');
  };

  handleSend = () => {
    const { actions, narrow } = this.props;
    const { topic, message } = this.state;

    const topicToSend = replaceEmoticonsWithEmoji(topic);
    const messageToSend = replaceEmoticonsWithEmoji(message);
    const destinationNarrow = isStreamNarrow(narrow)
      ? topicNarrow(narrow[0].operand, topicToSend || '(no topic)')
      : narrow;

    actions.addToOutbox(destinationNarrow, messageToSend);
    actions.deleteDraft(JSON.stringify(narrow));

    this.clearMessageInput();
  };

  handleEdit = () => {
    const { auth, editMessage, actions } = this.props;
    const { message, topic } = this.state;
    const content =
      editMessage.content !== message ? replaceEmoticonsWithEmoji(message) : undefined;
    const subject = topic !== editMessage.topic ? topic : undefined;
    if (content || subject) {
      updateMessage(auth, { content, subject }, editMessage.id).catch(error => {
        showErrorAlert(error.message, 'Failed to edit message');
      });
    }
    actions.cancelEditMessage();
  };

  tryUpdateDraft = () => {
    const { actions, draft, narrow } = this.props;
    const { message } = this.state;

    if (message.trim().length === 0) {
      actions.deleteDraft(JSON.stringify(narrow));
      return;
    }

    if (draft !== message) {
      actions.saveToDrafts(JSON.stringify(narrow), message);
    }
  };

  componentWillUnmount() {
    this.tryUpdateDraft();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.editMessage !== this.props.editMessage) {
      const topic =
        isStreamNarrow(nextProps.narrow) && nextProps.editMessage
          ? nextProps.editMessage.topic
          : '';
      this.setState({
        message: nextProps.editMessage ? nextProps.editMessage.content : '',
        topic,
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
    const {
      isMessageFocused,
      isTopicFocused,
      isMenuExpanded,
      height,
      message,
      topic,
      selection,
    } = this.state;
    const {
      auth,
      canSend,
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
      return <NotSubscribed narrow={narrow} />;
    }

    const canSelectTopic = (isMessageFocused || isTopicFocused) && isStreamNarrow(narrow);
    const placeholder = getComposeInputPlaceholder(narrow, auth.email, users);

    return (
      <View style={{ marginBottom: safeAreaInsets.bottom }}>
        <AutocompleteViewWrapper
          composeText={message}
          isTopicFocused={isTopicFocused}
          marginBottom={height}
          messageSelection={selection}
          narrow={narrow}
          topicText={topic}
          onMessageAutocomplete={this.handleMessageChange}
          onTopicAutocomplete={this.handleTopicChange}
        />
        <View style={styles.composeBox} onLayout={this.handleLayoutChange}>
          <View style={componentStyles.bottom}>
            <ComposeMenuContainer
              narrow={narrow}
              expanded={isMenuExpanded}
              onExpandContract={this.handleComposeMenuToggle}
            />
          </View>
          <View style={[componentStyles.composeText]}>
            {canSelectTopic && (
              <Input
                style={[componentStyles.topicInput]}
                underlineColorAndroid="transparent"
                placeholder="Topic"
                selectTextOnFocus
                textInputRef={component => {
                  this.topicInput = component;
                }}
                onChangeText={this.handleTopicChange}
                onFocus={this.handleTopicFocus}
                onBlur={this.handleTopicBlur}
                value={topic}
              />
            )}
            <MultilineInput
              style={styles.composeTextInput}
              maxHeight={MAX_HEIGHT}
              placeholder={placeholder}
              textInputRef={component => {
                this.messageInput = component;
                if (component) messageInputRef(component);
              }}
              value={message}
              onBlur={this.handleMessageBlur}
              onChange={this.handleMessageChange}
              onFocus={this.handleMessageFocus}
              onSelectionChange={this.handleMessageSelectionChange}
            />
          </View>
          <View style={componentStyles.bottom}>
            <FloatingActionButton
              style={componentStyles.button}
              Icon={editMessage === null ? IconSend : IconDone}
              size={32}
              disabled={message.trim().length === 0}
              onPress={editMessage === null ? this.handleSend : this.handleEdit}
            />
          </View>
        </View>
      </View>
    );
  }
}
