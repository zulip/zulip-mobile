/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Platform, View, TextInput, findNodeHandle, ScrollView } from 'react-native';
import type { LayoutEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import TextInputReset from 'react-native-text-input-reset';

import type {
  Auth,
  Context,
  Narrow,
  EditMessage,
  InputSelection,
  UserOrBot,
  Dispatch,
  Dimensions,
} from '../types';
import { connect } from '../react-redux';
import {
  addToOutbox,
  cancelEditMessage,
  draftUpdate,
  fetchTopicsForActiveStream,
  sendTypingEvent,
} from '../actions';
import * as api from '../api';
import { FloatingActionButton, Input } from '../common';
import { showErrorAlert } from '../utils/info';
import { IconDone, IconSend } from '../common/Icons';
import { isStreamNarrow, isStreamOrTopicNarrow, topicNarrow } from '../utils/narrow';
import ComposeMenu from './ComposeMenu';
import getComposeInputPlaceholder from './getComposeInputPlaceholder';
import NotSubscribed from '../message/NotSubscribed';
import AnnouncementOnly from '../message/AnnouncementOnly';

import {
  getAuth,
  getIsAdmin,
  getSession,
  getLastMessageTopic,
  getActiveUsersByEmail,
} from '../selectors';
import {
  getIsActiveStreamSubscribed,
  getIsActiveStreamAnnouncementOnly,
} from '../subscriptions/subscriptionSelectors';
import { getDraftForNarrow } from '../drafts/draftsSelectors';
import TopicAutocomplete from '../autocomplete/TopicAutocomplete';
import AutocompleteView from '../autocomplete/AutocompleteView';
import { getOwnEmail } from '../users/userSelectors';

type SelectorProps = {|
  auth: Auth,
  ownEmail: string,
  usersByEmail: Map<string, UserOrBot>,
  safeAreaInsets: Dimensions,
  isAdmin: boolean,
  isAnnouncementOnly: boolean,
  isSubscribed: boolean,
  editMessage: ?EditMessage,
  draft: string,
  lastMessageTopic: string,
|};

type Props = {|
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|};

type State = {|
  isMessageFocused: boolean,
  isTopicFocused: boolean,

  /** Almost the same as isMessageFocused || isTopicFocused ... except
   * debounced, to stay true while those flip from false/true to true/false
   * and back. */
  isFocused: boolean,

  isMenuExpanded: boolean,
  topic: string,
  message: string,
  height: number,
  selection: InputSelection,
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
    isFocused: false,
    isMenuExpanded: false,
    height: 20,
    topic: this.props.lastMessageTopic,
    message: this.props.draft,
    selection: { start: 0, end: 0 },
  };

  updateIsFocused = () => {
    this.setState(state => ({
      ...state,
      isFocused: state.isMessageFocused || state.isTopicFocused,
    }));
  };

  getCanSelectTopic = () => {
    const { editMessage, narrow } = this.props;
    if (editMessage) {
      return isStreamOrTopicNarrow(narrow);
    }
    if (!isStreamNarrow(narrow)) {
      return false;
    }
    return this.state.isFocused;
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

  handleLayoutChange = (event: LayoutEvent) => {
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

  handleMessageSelectionChange = (event: { +nativeEvent: { +selection: InputSelection } }) => {
    const { selection } = event.nativeEvent;
    this.setState({ selection });
  };

  handleMessageFocus = () => {
    this.setState((state, { lastMessageTopic }) => ({
      ...state,
      topic: state.topic || lastMessageTopic,
      isMessageFocused: true,
      isFocused: true,
      isMenuExpanded: false,
    }));
  };

  handleMessageBlur = () => {
    this.setState({
      isMessageFocused: false,
      isMenuExpanded: false,
    });
    setTimeout(this.updateIsFocused, 200); // give a chance to the topic input to get the focus
  };

  handleTopicFocus = () => {
    const { dispatch, narrow } = this.props;
    this.setState({
      isTopicFocused: true,
      isFocused: true,
      isMenuExpanded: false,
    });
    dispatch(fetchTopicsForActiveStream(narrow));
  };

  handleTopicBlur = () => {
    this.setState({
      isTopicFocused: false,
      isMenuExpanded: false,
    });
    setTimeout(this.updateIsFocused, 200); // give a chance to the message input to get the focus
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
    if (!editMessage) {
      throw new Error('expected editMessage');
    }
    const { message, topic } = this.state;
    const content = editMessage.content !== message ? message : undefined;
    const subject = topic !== editMessage.topic ? topic : undefined;
    if ((content !== undefined && content !== '') || (subject !== undefined && subject !== '')) {
      api.updateMessage(auth, { content, subject }, editMessage.id).catch(error => {
        showErrorAlert(error.message, 'Failed to edit message');
      });
    }
    dispatch(cancelEditMessage());
  };

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

  inputMarginPadding = {
    paddingHorizontal: 8,
    paddingVertical: Platform.select({
      ios: 8,
      android: 2,
    }),
  };

  styles = {
    autocompleteWrapper: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    composeBox: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    composeText: {
      paddingVertical: 8,
    },
    composeSendButton: {
      padding: 8,
    },
    topicInput: {
      borderWidth: 0,
      borderRadius: 5,
      marginBottom: 8,
      ...this.inputMarginPadding,
      ...this.context.styles.backgroundColor,
    },
    composeTextInput: {
      borderWidth: 0,
      borderRadius: 5,
      fontSize: 15,
      ...this.inputMarginPadding,
      ...this.context.styles.backgroundColor,
    },
  };

  render() {
    const { isTopicFocused, isMenuExpanded, height, message, topic, selection } = this.state;
    const {
      ownEmail,
      narrow,
      usersByEmail,
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

    const placeholder = getComposeInputPlaceholder(narrow, ownEmail, usersByEmail);
    const style = {
      paddingBottom: safeAreaInsets.bottom,
      backgroundColor: 'hsla(0, 0%, 50%, 0.1)',
    };

    return (
      <View>
        <View style={[this.styles.autocompleteWrapper, { marginBottom: height }]}>
          <TopicAutocomplete
            isFocused={isTopicFocused}
            narrow={narrow}
            text={topic}
            onAutocomplete={this.handleTopicAutocomplete}
          />
          <AutocompleteView
            isFocused={this.state.isMessageFocused}
            selection={selection}
            text={message}
            onAutocomplete={this.handleMessageAutocomplete}
          />
        </View>
        <View style={[this.styles.composeBox, style]} onLayout={this.handleLayoutChange}>
          <ComposeMenu
            destinationNarrow={this.getDestinationNarrow()}
            expanded={isMenuExpanded}
            onExpandContract={this.handleComposeMenuToggle}
          />
          <ScrollView contentContainerStyle={this.styles.composeText}>
            {this.getCanSelectTopic() && (
              <Input
                style={this.styles.topicInput}
                underlineColorAndroid="transparent"
                placeholder="Topic"
                defaultValue={topic}
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
            <Input
              multiline={!isMenuExpanded}
              style={this.styles.composeTextInput}
              underlineColorAndroid="transparent"
              placeholder={placeholder}
              defaultValue={message}
              textInputRef={component => {
                this.messageInput = component;
              }}
              onBlur={this.handleMessageBlur}
              onChangeText={this.handleMessageChange}
              onFocus={this.handleMessageFocus}
              onSelectionChange={this.handleMessageSelectionChange}
              onTouchStart={this.handleInputTouchStart}
            />
          </ScrollView>
          <FloatingActionButton
            style={this.styles.composeSendButton}
            Icon={editMessage === null ? IconSend : IconDone}
            size={32}
            disabled={message.trim().length === 0}
            onPress={editMessage === null ? this.handleSend : this.handleEdit}
          />
        </View>
      </View>
    );
  }
}

export default connect((state, props): SelectorProps => ({
  auth: getAuth(state),
  ownEmail: getOwnEmail(state),
  usersByEmail: getActiveUsersByEmail(state),
  safeAreaInsets: getSession(state).safeAreaInsets,
  isAdmin: getIsAdmin(state),
  isAnnouncementOnly: getIsActiveStreamAnnouncementOnly(state, props.narrow),
  isSubscribed: getIsActiveStreamSubscribed(state, props.narrow),
  editMessage: getSession(state).editMessage,
  draft: getDraftForNarrow(props.narrow)(state),
  lastMessageTopic: getLastMessageTopic(props.narrow)(state),
}))(ComposeBox);
