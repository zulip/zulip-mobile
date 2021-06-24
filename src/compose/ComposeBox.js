/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Platform, View, findNodeHandle } from 'react-native';
import type { LayoutEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import TextInputReset from 'react-native-text-input-reset';
import { type EdgeInsets } from 'react-native-safe-area-context';
import { compose } from 'redux';

import { withSafeAreaInsets } from '../react-native-safe-area-context';
import type { ThemeData } from '../styles';
import { ThemeContext } from '../styles';
import type {
  Narrow,
  InputSelection,
  UserOrBot,
  Dispatch,
  GetText,
  Subscription,
  Stream,
  UserId,
  VideoChatProvider,
} from '../types';
import { connect } from '../react-redux';
import { withGetText } from '../boot/TranslationProvider';
import { draftUpdate, sendTypingStart, sendTypingStop } from '../actions';
import { FloatingActionButton, Input } from '../common';
import { IconDone, IconSend } from '../common/Icons';
import {
  isStreamNarrow,
  isStreamOrTopicNarrow,
  isTopicNarrow,
  streamNameOfNarrow,
  topicNarrow,
  topicOfNarrow,
} from '../utils/narrow';
import ComposeMenu from './ComposeMenu';
import getComposeInputPlaceholder from './getComposeInputPlaceholder';
import NotSubscribed from '../message/NotSubscribed';
import AnnouncementOnly from '../message/AnnouncementOnly';
import MentionWarnings from './MentionWarnings';

import { getIsAdmin, getStreamInNarrow, getVideoChatProvider } from '../selectors';
import {
  getIsActiveStreamSubscribed,
  getIsActiveStreamAnnouncementOnly,
} from '../subscriptions/subscriptionSelectors';
import TopicAutocomplete from '../autocomplete/TopicAutocomplete';
import AutocompleteView from '../autocomplete/AutocompleteView';
import { getAllUsersById, getOwnUserId } from '../users/userSelectors';

type SelectorProps = {|
  ownUserId: UserId,
  allUsersById: Map<UserId, UserOrBot>,
  isAdmin: boolean,
  isAnnouncementOnly: boolean,
  isSubscribed: boolean,
  videoChatProvider: VideoChatProvider | null,
  stream: Subscription | {| ...Stream, in_home_view: boolean |},
|};

type Props = $ReadOnly<{|
  insets: EdgeInsets,

  narrow: Narrow,
  isEditing: boolean,

  onSend: (string, Narrow) => void,

  initialMessage?: string,
  initialTopic?: string,

  autoFocusTopic: boolean,
  autoFocusMessage: boolean,

  dispatch: Dispatch,
  ...SelectorProps,

  // From 'withGetText'
  _: GetText,
|}>;

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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const updateTextInput = (textInput, text) => {
  if (textInput === null) {
    // Depending on the lifecycle events this function is called from,
    // this might not be set yet.
    return;
  }

  // `textInput` is untyped; see definition.
  textInput.setNativeProps({ text });

  if (text.length === 0 && TextInputReset) {
    // React Native has problems with some custom keyboards when clearing
    // the input's contents.  Force reset to make sure it works.
    TextInputReset.resetKeyboardInput(findNodeHandle(textInput));
  }
};

class ComposeBox extends PureComponent<Props, State> {
  static defaultProps = {
    autoFocusTopic: false,
    autoFocusMessage: false,
  };

  static contextType = ThemeContext;
  context: ThemeData;

  // We should replace the fixme with
  // `React$ElementRef<typeof TextInput>` when we can. Currently, that
  // would make `.current` be `any(implicit)`, which we don't want;
  // this is probably down to bugs in Flow's special support for React.
  messageInputRef = React.createRef<$FlowFixMe>();
  topicInputRef = React.createRef<$FlowFixMe>();

  // TODO: Type-check this, once we've adjusted our `react-redux`
  // wrapper to do the right thing. It should be
  //
  //   mentionWarnings = React.createRef<React$ElementRef<MentionWarnings>>()
  //
  // but we need our `react-redux` wrapper to be aware of
  // `{ forwardRef: true }`, since we use that.
  mentionWarnings = React.createRef();

  inputBlurTimeoutId: ?TimeoutID = null;

  state = {
    isMessageFocused: false,
    isTopicFocused: false,
    isFocused: false,
    isMenuExpanded: false,
    height: 20,
    topic:
      this.props.initialTopic !== undefined
        ? this.props.initialTopic
        : isTopicNarrow(this.props.narrow)
        ? topicOfNarrow(this.props.narrow)
        : '',
    message: this.props.initialMessage || '',
    selection: { start: 0, end: 0 },
  };

  componentWillUnmount() {
    clearTimeout(this.inputBlurTimeoutId);
    this.inputBlurTimeoutId = null;
  }

  updateIsFocused = () => {
    this.setState(state => ({
      ...state,
      isFocused: state.isMessageFocused || state.isTopicFocused,
    }));
  };

  getCanSelectTopic = () => {
    const { isEditing, narrow } = this.props;
    if (isEditing) {
      return isStreamOrTopicNarrow(narrow);
    }
    if (!isStreamNarrow(narrow)) {
      return false;
    }
    return this.state.isFocused;
  };

  setMessageInputValue = (message: string) => {
    updateTextInput(this.messageInputRef.current, message);
    this.handleMessageChange(message);
  };

  setTopicInputValue = (topic: string) => {
    updateTextInput(this.topicInputRef.current, topic);
    this.handleTopicChange(topic);
  };

  insertMessageTextAtCursorPosition = (text: string) => {
    const { message, selection } = this.state;

    this.setMessageInputValue(
      message.slice(0, selection.start) + text + message.slice(selection.end, message.length),
    );
  };

  insertVideoCallLinkAtCursorPosition = (url: string) => {
    const { _ } = this.props;
    const linkMessage = _('Click to join video call');
    const linkText = `[${linkMessage}](${url})`;

    this.insertMessageTextAtCursorPosition(linkText);
  };

  insertVideoCallLink = (videoChatProvider: VideoChatProvider) => {
    if (videoChatProvider.name === 'jitsi_meet') {
      // This is meant to align with the way the webapp generates jitsi video
      // call IDs. That logic can be found in the ".video_link" click handler
      // in static/js/compose.js.
      const videoCallId = randomInt(100000000000000, 999999999999999);
      const videoCallUrl = `${videoChatProvider.jitsiServerUrl}/${videoCallId}`;
      this.insertVideoCallLinkAtCursorPosition(videoCallUrl);
    }
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
    dispatch(sendTypingStart(narrow));
    dispatch(draftUpdate(narrow, message));
  };

  // See JSDoc on 'onAutocomplete' in 'AutocompleteView.js'.
  handleMessageAutocomplete = (
    completedText: string,
    completion: string,
    lastWordPrefix: string,
  ) => {
    this.setMessageInputValue(completedText);

    if (lastWordPrefix === '@') {
      // https://github.com/eslint/eslint/issues/11045
      // eslint-disable-next-line no-unused-expressions
      this.mentionWarnings.current?.handleMentionSubscribedCheck(completion);
    }
  };

  handleMessageSelectionChange = (event: {
    +nativeEvent: { +selection: InputSelection, ... },
    ...
  }) => {
    const { selection } = event.nativeEvent;
    this.setState({ selection });
  };

  handleMessageFocus = () => {
    this.setState({
      isMessageFocused: true,
      isFocused: true,
      isMenuExpanded: false,
    });
  };

  handleMessageBlur = () => {
    this.setState({
      isMessageFocused: false,
      isMenuExpanded: false,
    });
    // give a chance to the topic input to get the focus
    clearTimeout(this.inputBlurTimeoutId);
    this.inputBlurTimeoutId = setTimeout(this.updateIsFocused, 200);
  };

  handleTopicFocus = () => {
    this.setState({
      isTopicFocused: true,
      isFocused: true,
      isMenuExpanded: false,
    });
  };

  handleTopicBlur = () => {
    this.setState({
      isTopicFocused: false,
      isMenuExpanded: false,
    });
    // give a chance to the message input to get the focus
    clearTimeout(this.inputBlurTimeoutId);
    this.inputBlurTimeoutId = setTimeout(this.updateIsFocused, 200);
  };

  handleInputTouchStart = () => {
    this.setState({ isMenuExpanded: false });
  };

  getDestinationNarrow = (): Narrow => {
    const { narrow } = this.props;
    if (isStreamNarrow(narrow) || isTopicNarrow(narrow)) {
      const streamName = streamNameOfNarrow(narrow);
      const topic = this.state.topic.trim();
      return topicNarrow(streamName, topic || '(no topic)');
    }
    return narrow;
  };

  handleSend = () => {
    const { dispatch } = this.props;
    const { message } = this.state;
    const narrow = this.getDestinationNarrow();

    this.props.onSend(message, narrow);

    this.setMessageInputValue('');

    if (this.mentionWarnings.current) {
      this.mentionWarnings.current.clearMentionWarnings();
    }

    dispatch(sendTypingStop(narrow));
  };

  inputMarginPadding = {
    paddingHorizontal: 8,
    paddingVertical: Platform.select({
      ios: 8,
      android: 2,
    }),
  };

  styles = {
    wrapper: {
      flexShrink: 1,
      maxHeight: '60%',
    },
    autocompleteWrapper: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    composeBox: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      flexShrink: 1,
    },
    composeText: {
      flex: 1,
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
    },
    composeTextInput: {
      borderWidth: 0,
      borderRadius: 5,
      fontSize: 15,
      flexShrink: 1,
      ...this.inputMarginPadding,
    },
  };

  render() {
    const { isTopicFocused, isMenuExpanded, height, message, topic, selection } = this.state;
    const {
      ownUserId,
      narrow,
      allUsersById,
      isEditing,
      insets,
      isAdmin,
      isAnnouncementOnly,
      isSubscribed,
      stream,
      videoChatProvider,
    } = this.props;

    const insertVideoCallLink =
      videoChatProvider !== null ? () => this.insertVideoCallLink(videoChatProvider) : null;

    if (!isSubscribed) {
      return <NotSubscribed narrow={narrow} />;
    } else if (isAnnouncementOnly && !isAdmin) {
      return <AnnouncementOnly />;
    }

    const placeholder = getComposeInputPlaceholder(narrow, ownUserId, allUsersById);
    const style = {
      paddingBottom: insets.bottom,
      backgroundColor: 'hsla(0, 0%, 50%, 0.1)',
    };

    return (
      <View style={this.styles.wrapper}>
        {/*
          $FlowFixMe[incompatible-use]:
          `MentionWarnings` should use a type-checked `connect`
        */}
        <MentionWarnings narrow={narrow} stream={stream} ref={this.mentionWarnings} />
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
            insertVideoCallLink={insertVideoCallLink}
            onExpandContract={this.handleComposeMenuToggle}
          />
          <View style={this.styles.composeText}>
            {this.getCanSelectTopic() && (
              <Input
                style={[this.styles.topicInput, { backgroundColor: this.context.backgroundColor }]}
                underlineColorAndroid="transparent"
                placeholder="Topic"
                defaultValue={topic}
                autoFocus={this.props.autoFocusTopic}
                selectTextOnFocus
                textInputRef={this.topicInputRef}
                onChangeText={this.handleTopicChange}
                onFocus={this.handleTopicFocus}
                onBlur={this.handleTopicBlur}
                onTouchStart={this.handleInputTouchStart}
              />
            )}
            <Input
              multiline={!isMenuExpanded}
              style={[
                this.styles.composeTextInput,
                { backgroundColor: this.context.backgroundColor },
              ]}
              underlineColorAndroid="transparent"
              placeholder={placeholder}
              defaultValue={message}
              autoFocus={this.props.autoFocusMessage}
              textInputRef={this.messageInputRef}
              onBlur={this.handleMessageBlur}
              onChangeText={this.handleMessageChange}
              onFocus={this.handleMessageFocus}
              onSelectionChange={this.handleMessageSelectionChange}
              onTouchStart={this.handleInputTouchStart}
            />
          </View>
          <FloatingActionButton
            accessibilityLabel="Send message"
            style={this.styles.composeSendButton}
            Icon={isEditing ? IconDone : IconSend}
            size={32}
            disabled={message.trim().length === 0}
            onPress={this.handleSend}
          />
        </View>
      </View>
    );
  }
}

export default compose(
  connect<SelectorProps, _, _>((state, props) => ({
    ownUserId: getOwnUserId(state),
    allUsersById: getAllUsersById(state),
    isAdmin: getIsAdmin(state),
    isAnnouncementOnly: getIsActiveStreamAnnouncementOnly(state, props.narrow),
    isSubscribed: getIsActiveStreamSubscribed(state, props.narrow),
    stream: getStreamInNarrow(state, props.narrow),
    videoChatProvider: getVideoChatProvider(state),
  })),
  withSafeAreaInsets,
)(withGetText(ComposeBox));
