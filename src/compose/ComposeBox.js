/* @flow */
import React, { PureComponent } from 'react';
import { View, TextInput, findNodeHandle } from 'react-native';
import TextInputReset from 'react-native-text-input-reset';
import isEqual from 'lodash.isequal';

import type {
  Auth,
  Context,
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
import NotSubscribed from '../message/NotSubscribed';

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
};

type State = {
  isMessageFocused: boolean,
  isTopicFocused: boolean,
  isMenuExpanded: boolean,
  topic: string,
  message: string,
  messageBoxPlaceholder: string,
  height: number,
  selection: InputSelectionType,
};

export default class ComposeBox extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State;

  messageInput: TextInput = null;
  topicInput: TextInput = null;

  static contextTypes = {
    styles: () => null,
  };

  state = {
    isMessageFocused: false,
    isTopicFocused: false,
    isMenuExpanded: false,
    height: 20,
    topic: '',
    message: this.props.draft,
    messageBoxPlaceholder: getComposeInputPlaceholder(
      this.props.narrow,
      this.props.auth.email,
      this.props.users,
    ),
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

    const destinationNarrow = isStreamNarrow(narrow)
      ? topicNarrow(narrow[0].operand, topic || '(no topic)')
      : narrow;

    actions.addToOutbox(destinationNarrow, message);
    actions.draftRemove(narrow);

    this.clearMessageInput();
  };

  handleEdit = () => {
    const { auth, editMessage, actions } = this.props;
    const { message, topic } = this.state;
    const content = editMessage.content !== message ? message : undefined;
    const subject = topic !== editMessage.topic ? topic : undefined;
    if (content || subject) {
      updateMessage(auth, { content, subject }, editMessage.id).catch(error => {
        showErrorAlert(error.message, 'Failed to edit message');
      });
    }
    actions.cancelEditMessage();
  };

  onComposeMenuAnimationCompleted = (isVisible: boolean) => {
    const { auth, narrow, users } = this.props;
    this.setState({
      messageBoxPlaceholder: isVisible
        ? 'Message'
        : getComposeInputPlaceholder(narrow, auth.email, users),
    });
  };

  tryUpdateDraft = () => {
    const { actions, draft, narrow } = this.props;
    const { message } = this.state;

    if (draft.trim() === message.trim()) {
      return;
    }

    if (message.trim().length === 0) {
      actions.draftRemove(narrow);
    } else {
      actions.draftAdd(narrow, message);
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
      if (this.messageInput) {
        this.messageInput.focus();
      }
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
      messageBoxPlaceholder,
      topic,
      selection,
    } = this.state;
    const {
      canSend,
      narrow,
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
    const placeholder = isMenuExpanded ? 'Message' : messageBoxPlaceholder;

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
          <View style={styles.alignBottom}>
            <ComposeMenuContainer
              onAnimationCompleted={this.onComposeMenuAnimationCompleted}
              narrow={narrow}
              expanded={isMenuExpanded}
              onExpandContract={this.handleComposeMenuToggle}
            />
          </View>
          <View style={styles.composeText}>
            {canSelectTopic && (
              <Input
                style={styles.topicInput}
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
              placeholder={placeholder}
              textInputRef={component => {
                if (component) {
                  this.messageInput = component;
                  messageInputRef(component);
                }
              }}
              value={message}
              onBlur={this.handleMessageBlur}
              onChange={this.handleMessageChange}
              onFocus={this.handleMessageFocus}
              onSelectionChange={this.handleMessageSelectionChange}
            />
          </View>
          <View style={styles.alignBottom}>
            <FloatingActionButton
              style={styles.composeSendButton}
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
