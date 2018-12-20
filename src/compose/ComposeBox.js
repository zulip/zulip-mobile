/* @flow */
import React, { PureComponent } from 'react';
import { View, TextInput, findNodeHandle } from 'react-native';
import { connect } from 'react-redux';
import TextInputReset from 'react-native-text-input-reset';

import type {
  Auth,
  Context,
  Narrow,
  EditMessage,
  InputSelectionType,
  User,
  Dispatch,
  Dimensions,
  GlobalState,
} from '../types';
import {
  addToOutbox,
  cancelEditMessage,
  draftUpdate,
  fetchTopicsForActiveStream,
  sendTypingEvent,
} from '../actions';
import { updateMessage } from '../api';
import { FloatingActionButton, Input, MultilineInput } from '../common';
import { showErrorAlert } from '../utils/info';
import { IconDone, IconSend } from '../common/Icons';
import { isStreamNarrow, isStreamOrTopicNarrow, topicNarrow } from '../utils/narrow';
import styles from '../styles';
import ComposeMenu from './ComposeMenu';
import AutocompleteViewWrapper from '../autocomplete/AutocompleteViewWrapper';
import getComposeInputPlaceholder from './getComposeInputPlaceholder';
import NotSubscribed from '../message/NotSubscribed';
import AnnouncementOnly from '../message/AnnouncementOnly';

import {
  getAuth,
  getIsAdmin,
  getSession,
  canSendToActiveNarrow,
  getLastMessageTopic,
  getActiveUsers,
  getShowMessagePlaceholders,
} from '../selectors';
import {
  getIsActiveStreamSubscribed,
  getIsActiveStreamAnnouncementOnly,
} from '../subscriptions/subscriptionSelectors';
import { getDraftForActiveNarrow } from '../drafts/draftsSelectors';

type Props = {|
  auth: Auth,
  canSend: boolean,
  narrow: Narrow,
  users: User[],
  draft: string,
  lastMessageTopic: string,
  isAdmin: boolean,
  isAnnouncementOnly: boolean,
  isSubscribed: boolean,
  editMessage: EditMessage,
  safeAreaInsets: Dimensions,
  dispatch: Dispatch,
|};

type State = {|
  isMessageFocused: boolean,
  isTopicFocused: boolean,
  isMenuExpanded: boolean,
  topic: string,
  message: string,
  height: number,
  selection: InputSelectionType,
|};

export const updateTextInput = (textInput: ?TextInput, text: string): void => {
  if (!textInput) {
    // Depending on the lifecycle events this function is called from,
    // this might not be set yet.
    return;
  }

  textInput.setNativeProps({ text });

  if (text.length === 0 && TextInputReset) {
    // React Native has problems with some custom keyboards when clearing
    // the input's contents.  Force reset to make sure it works.
    TextInputReset.resetKeyboardInput(findNodeHandle(textInput));
  }
};

class ComposeBox extends PureComponent<Props, State> {
  context: Context;

  messageInput: ?TextInput = null;
  topicInput: ?TextInput = null;

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
    selection: { start: 0, end: 0 },
  };

  getCanSelectTopic = () => {
    const { isMessageFocused, isTopicFocused } = this.state;
    const { editMessage, narrow } = this.props;
    if (editMessage) {
      return isStreamOrTopicNarrow(narrow);
    }
    if (!isStreamNarrow(narrow)) {
      return false;
    }
    return isMessageFocused || isTopicFocused;
  };

  setMessageInputValue = (message: string) => {
    updateTextInput(this.messageInput, message);
    this.handleMessageChange(message);
  };

  setTopicInputValue = (topic: string) => {
    updateTextInput(this.topicInput, topic);
    this.handleTopicChange(topic);
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
    this.setState({ topic, isMenuExpanded: false });
  };

  handleTopicAutocomplete = (topic: string) => {
    this.setTopicInputValue(topic);
  };

  handleMessageChange = (message: string) => {
    this.setState({ message, isMenuExpanded: false });
    const { dispatch, narrow } = this.props;
    dispatch(sendTypingEvent(narrow));
    dispatch(draftUpdate(narrow, message));
  };

  handleMessageAutocomplete = (message: string) => {
    this.setMessageInputValue(message);
  };

  handleMessageSelectionChange = (event: Object) => {
    const { selection } = event.nativeEvent;
    this.setState({ selection });
  };

  handleMessageFocus = () => {
    const { topic } = this.state;
    const { lastMessageTopic } = this.props;
    this.setState({
      isMessageFocused: true,
      isMenuExpanded: false,
    });
    setTimeout(() => {
      this.setTopicInputValue(topic || lastMessageTopic);
    }, 200); // wait, to hope the component is shown
  };

  handleMessageBlur = () => {
    setTimeout(() => {
      this.setState({
        isMessageFocused: false,
        isMenuExpanded: false,
      });
    }, 200); // give a chance to the topic input to get the focus
  };

  handleTopicFocus = () => {
    const { dispatch, narrow } = this.props;
    this.setState({
      isTopicFocused: true,
      isMenuExpanded: false,
    });
    dispatch(fetchTopicsForActiveStream(narrow));
  };

  handleTopicBlur = () => {
    setTimeout(() => {
      this.setState({
        isTopicFocused: false,
        isMenuExpanded: false,
      });
    }, 200); // give a chance to the message input to get the focus
  };

  handleInputTouchStart = () => {
    this.setState({ isMenuExpanded: false });
  };

  getDestinationNarrow = (): Narrow => {
    const { narrow } = this.props;
    const { topic } = this.state;
    return isStreamNarrow(narrow) ? topicNarrow(narrow[0].operand, topic || '(no topic)') : narrow;
  };

  handleSend = () => {
    const { dispatch } = this.props;
    const { message } = this.state;

    dispatch(addToOutbox(this.getDestinationNarrow(), message));

    this.setMessageInputValue('');
  };

  handleEdit = () => {
    const { auth, editMessage, dispatch } = this.props;
    const { message, topic } = this.state;
    const content = editMessage.content !== message ? message : undefined;
    const subject = topic !== editMessage.topic ? topic : undefined;
    if (content || subject) {
      updateMessage(auth, { content, subject }, editMessage.id).catch(error => {
        showErrorAlert(error.message, 'Failed to edit message');
      });
    }
    dispatch(cancelEditMessage());
  };

  componentDidMount() {
    const { message, topic } = this.state;

    updateTextInput(this.messageInput, message);
    updateTextInput(this.topicInput, topic);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.editMessage !== this.props.editMessage) {
      const topic =
        isStreamNarrow(nextProps.narrow) && nextProps.editMessage
          ? nextProps.editMessage.topic
          : '';
      const message = nextProps.editMessage ? nextProps.editMessage.content : '';
      this.setMessageInputValue(message);
      this.setTopicInputValue(topic);
      if (this.messageInput) {
        this.messageInput.focus();
      }
    }
  }

  styles = {
    topicInput: [styles.topicInput, this.context.styles.backgroundColor],
    composeTextInput: [
      styles.composeTextInput,
      this.context.styles.backgroundColor,
      this.context.styles.color,
    ],
  };

  render() {
    const { styles: contextStyles } = this.context;
    const { isTopicFocused, isMenuExpanded, height, message, topic, selection } = this.state;
    const {
      auth,
      canSend,
      narrow,
      users,
      editMessage,
      safeAreaInsets,
      isAdmin,
      isAnnouncementOnly,
      isSubscribed,
    } = this.props;

    if (!isSubscribed) {
      return <NotSubscribed narrow={narrow} />;
    } else if (isAnnouncementOnly && !isAdmin) {
      return <AnnouncementOnly />;
    }

    const placeholder = getComposeInputPlaceholder(narrow, auth.email, users);
    const style = {
      marginBottom: safeAreaInsets.bottom,
      ...(canSend ? {} : { display: 'none' }),
    };

    return (
      <View style={style}>
        <AutocompleteViewWrapper
          composeText={message}
          isTopicFocused={isTopicFocused}
          marginBottom={height}
          messageSelection={selection}
          narrow={narrow}
          topicText={topic}
          onMessageAutocomplete={this.handleMessageAutocomplete}
          onTopicAutocomplete={this.handleTopicAutocomplete}
        />
        <View style={styles.composeBox} onLayout={this.handleLayoutChange}>
          <View style={contextStyles.alignBottom}>
            <ComposeMenu
              destinationNarrow={this.getDestinationNarrow()}
              expanded={isMenuExpanded}
              onExpandContract={this.handleComposeMenuToggle}
            />
          </View>
          <View style={styles.composeText}>
            {this.getCanSelectTopic() && (
              <Input
                style={this.styles.topicInput}
                underlineColorAndroid="transparent"
                placeholder="Topic"
                selectTextOnFocus
                textInputRef={component => {
                  this.topicInput = component;
                }}
                onChangeText={this.handleTopicChange}
                onFocus={this.handleTopicFocus}
                onBlur={this.handleTopicBlur}
                onTouchStart={this.handleInputTouchStart}
              />
            )}
            <MultilineInput
              style={this.styles.composeTextInput}
              placeholder={placeholder}
              textInputRef={component => {
                if (component) {
                  this.messageInput = component;
                }
              }}
              onBlur={this.handleMessageBlur}
              onChangeText={this.handleMessageChange}
              onFocus={this.handleMessageFocus}
              onSelectionChange={this.handleMessageSelectionChange}
              onTouchStart={this.handleInputTouchStart}
            />
          </View>
          <View style={contextStyles.alignBottom}>
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

export default connect((state: GlobalState, props) => ({
  auth: getAuth(state),
  users: getActiveUsers(state),
  safeAreaInsets: getSession(state).safeAreaInsets,
  isAdmin: getIsAdmin(state),
  isAnnouncementOnly: getIsActiveStreamAnnouncementOnly(props.narrow)(state),
  isSubscribed: getIsActiveStreamSubscribed(props.narrow)(state),
  canSend: canSendToActiveNarrow(props.narrow) && !getShowMessagePlaceholders(props.narrow)(state),
  editMessage: getSession(state).editMessage,
  draft: getDraftForActiveNarrow(props.narrow)(state),
  lastMessageTopic: getLastMessageTopic(props.narrow)(state),
}))(ComposeBox);
