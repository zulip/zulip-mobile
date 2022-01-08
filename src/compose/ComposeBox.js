/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { ComponentType } from 'react';
import { Platform, View } from 'react-native';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import type { LayoutEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import { type EdgeInsets } from 'react-native-safe-area-context';
import { compose } from 'redux';
import invariant from 'invariant';

import * as apiConstants from '../api/constants';
import { withSafeAreaInsets } from '../react-native-safe-area-context';
import type { ThemeData } from '../styles';
import { ThemeContext } from '../styles';
import type {
  Auth,
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
import { showToast, showErrorAlert } from '../utils/info';
import { IconDone, IconSend } from '../common/Icons';
import {
  isConversationNarrow,
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
import {
  getAuth,
  getIsAdmin,
  getStreamInNarrow,
  getVideoChatProvider,
  getRealm,
} from '../selectors';
import {
  getIsActiveStreamSubscribed,
  getIsActiveStreamAnnouncementOnly,
} from '../subscriptions/subscriptionSelectors';
import TopicAutocomplete from '../autocomplete/TopicAutocomplete';
import AutocompleteView from '../autocomplete/AutocompleteView';
import { getAllUsersById, getOwnUserId } from '../users/userSelectors';
import * as api from '../api';

type SelectorProps = {|
  auth: Auth,
  ownUserId: UserId,
  allUsersById: Map<UserId, UserOrBot>,
  isAdmin: boolean,
  isAnnouncementOnly: boolean,
  isSubscribed: boolean,
  videoChatProvider: VideoChatProvider | null,
  mandatoryTopics: boolean,
  stream: Subscription | {| ...Stream, in_home_view: boolean |},
|};

type OuterProps = $ReadOnly<{|
  /** The narrow shown in the message list.  Must be a conversation or stream. */
  // In particular `getDestinationNarrow` makes assumptions about the narrow
  // (and other code might too.)
  narrow: Narrow,

  onSend: (message: string, destinationNarrow: Narrow) => void,

  isEditing: boolean,

  /** The contents of the message that the ComposeBox should contain when it's first rendered */
  initialMessage?: string,
  /** The topic of the message that the ComposeBox should contain when it's first rendered */
  initialTopic?: string,

  /** Whether the topic input box should auto-foucs when the component renders.
   *
   * Passed through to the TextInput's autofocus prop. */
  autoFocusTopic?: boolean,
  /** Whether the message input box should auto-foucs when the component renders.
   *
   * Passed through to the TextInput's autofocus prop. */
  autoFocusMessage?: boolean,
|}>;

type Props = $ReadOnly<{|
  ...OuterProps,
  ...SelectorProps,

  // From 'withGetText'
  _: GetText,

  // from withSafeAreaInsets
  insets: EdgeInsets,

  // from `connect`
  dispatch: Dispatch,
  ...SelectorProps,
|}>;

type State = {|
  isMessageFocused: boolean,
  isTopicFocused: boolean,
  numUploading: number,

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

const FOCUS_DEBOUNCE_TIME_MS = 16;

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
};

class ComposeBoxInner extends PureComponent<Props, State> {
  static contextType = ThemeContext;
  context: ThemeData;

  // We should replace the fixme with
  // `React$ElementRef<typeof TextInput>` when we can. Currently, that
  // would make `.current` be `any(implicit)`, which we don't want;
  // this is probably down to bugs in Flow's special support for React.
  messageInputRef = React.createRef<$FlowFixMe>();
  topicInputRef = React.createRef<$FlowFixMe>();

  mentionWarnings = React.createRef<React$ElementRef<typeof MentionWarnings>>();

  inputBlurTimeoutId: ?TimeoutID = null;

  state = {
    isMessageFocused: false,
    isTopicFocused: false,
    isFocused: false,
    isMenuExpanded: false,
    height: 20,
    topic:
      this.props.initialTopic
      ?? (isTopicNarrow(this.props.narrow) ? topicOfNarrow(this.props.narrow) : ''),
    message: this.props.initialMessage ?? '',
    selection: { start: 0, end: 0 },
    numUploading: 0,
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

  insertAttachment = async (attachments: $ReadOnlyArray<DocumentPickerResponse>) => {
    this.setState(({ numUploading }) => ({
      numUploading: numUploading + 1,
    }));
    try {
      const { _, auth } = this.props;

      const fileNames: string[] = [];
      const placeholders: string[] = [];
      for (let i = 0; i < attachments.length; i++) {
        const fileName = attachments[i].name ?? _('Attachment {num}', { num: i + 1 });
        fileNames.push(fileName);
        const placeholder = `[${_('Uploading {fileName}...', { fileName })}]()`;
        placeholders.push(placeholder);
      }
      this.insertMessageTextAtCursorPosition(placeholders.join('\n\n'));

      for (let i = 0; i < attachments.length; i++) {
        const fileName = fileNames[i];
        const placeholder = placeholders[i];
        let response = null;
        try {
          response = await api.uploadFile(auth, attachments[i].uri, fileName);
        } catch (e) {
          showToast(_('Failed to upload file: {fileName}', { fileName }));
          this.setMessageInputValue(
            this.state.message.replace(
              placeholder,
              `[${_('Failed to upload file: {fileName}', { fileName })}]()`,
            ),
          );
          continue;
        }

        const linkText = `[${fileName}](${response.uri})`;
        if (this.state.message.indexOf(placeholder) !== -1) {
          this.setMessageInputValue(this.state.message.replace(placeholder, linkText));
        } else {
          this.setMessageInputValue(`${this.state.message}\n${linkText}`);
        }
      }
    } finally {
      this.setState(({ numUploading }) => ({
        numUploading: numUploading - 1,
      }));
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
    this.messageInputRef.current?.focus();
  };

  handleMessageChange = (message: string) => {
    this.setState({ message, isMenuExpanded: false });
    const { dispatch, isEditing, narrow } = this.props;
    if (message.length === 0) {
      dispatch(sendTypingStop(narrow));
    } else {
      dispatch(sendTypingStart(narrow));
    }
    if (!isEditing) {
      dispatch(draftUpdate(narrow, message));
    }
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
    if (
      !this.props.isEditing
      && isStreamNarrow(this.props.narrow)
      && !this.state.isFocused
      && this.state.topic === ''
    ) {
      // We weren't showing the topic input when the user tapped on the input
      // to focus it, but we're about to show it.  Focus that, if the user
      // hasn't already selected a topic.
      this.topicInputRef.current?.focus();
    } else {
      this.setState({
        isMessageFocused: true,
        isFocused: true,
        isMenuExpanded: false,
      });
    }
  };

  handleMessageBlur = () => {
    this.setState({
      isMessageFocused: false,
      isMenuExpanded: false,
    });
    const { dispatch, narrow } = this.props;
    dispatch(sendTypingStop(narrow));
    // give a chance to the topic input to get the focus
    clearTimeout(this.inputBlurTimeoutId);
    this.inputBlurTimeoutId = setTimeout(this.updateIsFocused, FOCUS_DEBOUNCE_TIME_MS);
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
    this.inputBlurTimeoutId = setTimeout(this.updateIsFocused, FOCUS_DEBOUNCE_TIME_MS);
  };

  handleInputTouchStart = () => {
    this.setState({ isMenuExpanded: false });
  };

  getDestinationNarrow = (): Narrow => {
    const { narrow, isEditing } = this.props;
    if (isStreamNarrow(narrow) || (isTopicNarrow(narrow) && isEditing)) {
      const streamName = streamNameOfNarrow(narrow);
      const topic = this.state.topic.trim();
      return topicNarrow(streamName, topic || apiConstants.NO_TOPIC_TOPIC);
    }
    invariant(isConversationNarrow(narrow), 'destination narrow must be conversation');
    return narrow;
  };

  handleSend = () => {
    const { dispatch, mandatoryTopics, _ } = this.props;
    const { message } = this.state;
    const destinationNarrow = this.getDestinationNarrow();

    if (
      isTopicNarrow(destinationNarrow)
      && topicOfNarrow(destinationNarrow) === apiConstants.NO_TOPIC_TOPIC
      && mandatoryTopics
    ) {
      // TODO how should this behave in the isEditing case? See
      //   https://github.com/zulip/zulip-mobile/pull/4798#discussion_r731341400.
      showErrorAlert(_('Message not sent'), _('Please specify a topic.'));
      return;
    }

    this.props.onSend(message, destinationNarrow);

    this.setMessageInputValue('');

    if (this.mentionWarnings.current) {
      this.mentionWarnings.current.clearMentionWarnings();
    }

    dispatch(sendTypingStop(destinationNarrow));
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
            insertAttachment={this.insertAttachment}
            insertVideoCallLink={insertVideoCallLink}
            onExpandContract={this.handleComposeMenuToggle}
          />
          <View style={this.styles.composeText}>
            <Input
              style={[
                this.styles.topicInput,
                { backgroundColor: this.context.backgroundColor },
                // This is a really dumb hack to work around
                // https://github.com/facebook/react-native/issues/16405.
                // Someone suggests in that thread that { position: absolute,
                // zIndex: -1 } will work, which it does not (the border of the
                // TextInput is still visible, even with very negative zIndex
                // values). Someone else suggests { transform: [{scale: 0}] }
                // (https://stackoverflow.com/a/49817873), which doesn't work
                // either. However, a combinarion of the two of them seems to
                // work.
                !this.getCanSelectTopic() && { position: 'absolute', transform: [{ scale: 0 }] },
              ]}
              autoCapitalize="none"
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
              onSubmitEditing={() => this.messageInputRef.current?.focus()}
              blurOnSubmit={false}
              returnKeyType="next"
            />
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
            disabled={message.trim().length === 0 || this.state.numUploading > 0}
            onPress={this.handleSend}
          />
        </View>
      </View>
    );
  }
}

const ComposeBox: ComponentType<OuterProps> = compose(
  connect<SelectorProps, _, _>((state, props) => ({
    auth: getAuth(state),
    ownUserId: getOwnUserId(state),
    allUsersById: getAllUsersById(state),
    isAdmin: getIsAdmin(state),
    isAnnouncementOnly: getIsActiveStreamAnnouncementOnly(state, props.narrow),
    isSubscribed: getIsActiveStreamSubscribed(state, props.narrow),
    stream: getStreamInNarrow(state, props.narrow),
    videoChatProvider: getVideoChatProvider(state),
    mandatoryTopics: getRealm(state).mandatoryTopics,
  })),
  withSafeAreaInsets,
)(withGetText(ComposeBoxInner));

export default ComposeBox;
