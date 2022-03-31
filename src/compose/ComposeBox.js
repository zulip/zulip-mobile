/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { ComponentType } from 'react';
import { Platform, View, Modal, Text } from 'react-native';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import type { LayoutEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import { type EdgeInsets } from 'react-native-safe-area-context';
import { compose } from 'redux';
import invariant from 'invariant';

import * as apiConstants from '../api/constants';
import { withSafeAreaInsets } from '../react-native-safe-area-context';
import type { ThemeData } from '../styles';
import { ThemeContext, BRAND_COLOR } from '../styles';
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
import Touchable from '../common/Touchable';
import Input from '../common/Input';
import { showToast, showErrorAlert } from '../utils/info';
import { IconDone, IconSend, IconExpand, IconCompress } from '../common/Icons';
import {
  isConversationNarrow,
  isStreamNarrow,
  isStreamOrTopicNarrow,
  isTopicNarrow,
  streamIdOfNarrow,
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
  getStreamsById,
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
import { ensureUnreachable } from '../generics';

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
  streamsById: Map<number, Stream>,
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
  isExpanded: boolean,
|};

// TODO(?): Could deduplicate with this type in ShareWrapper.
export type ValidationError = 'upload-in-progress' | 'message-empty' | 'mandatory-topic-empty';

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
    isExpanded: false,
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
      const streamId = streamIdOfNarrow(narrow);
      const topic = this.state.topic.trim() || apiConstants.NO_TOPIC_TOPIC;
      return topicNarrow(streamId, topic);
    }
    invariant(isConversationNarrow(narrow), 'destination narrow must be conversation');
    return narrow;
  };

  handleSubmit = () => {
    const { dispatch, _, isEditing } = this.props;
    const { message } = this.state;
    const destinationNarrow = this.getDestinationNarrow();
    const validationErrors = this.getValidationErrors();

    if (validationErrors.length > 0) {
      const msg = validationErrors
        .map(error => {
          // 'upload-in-progress' | 'message-empty' | 'mandatory-topic-empty'
          switch (error) {
            case 'upload-in-progress':
              return _('Please wait for the upload to complete.');
            case 'mandatory-topic-empty':
              return _('Please specify a topic.');
            case 'message-empty':
              return _('Message is empty.');
            default:
              ensureUnreachable(error);
              throw new Error();
          }
        })
        .join('\n\n');

      // TODO is this enough to handle the `isEditing` case? See
      //   https://github.com/zulip/zulip-mobile/pull/4798#discussion_r731341400.
      showErrorAlert(isEditing ? _('Message not saved') : _('Message not sent'), msg);
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
    expandedWrapper: {
      flex: 1,
    },
    autocompleteWrapper: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    messageTitle: {
      flexDirection: 'column',
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
    submitButtonContainer: {
      padding: 8,
    },
    submitButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: BRAND_COLOR,
      borderRadius: 32,
      padding: 8,
    },
    expandedSendButton: {
      position: 'absolute',
      right: 15,
      top: 8,
    },
    topicInput: {
      borderWidth: 0,
      borderRadius: 5,
      marginBottom: 8,
      ...this.inputMarginPadding,
    },
    composeTextInput: {
      paddingRight: 10,
      borderWidth: 0,
      borderRadius: 5,
      fontSize: 15,
      flexShrink: 1,
      ...this.inputMarginPadding,
    },
    expandedTextInput: {
      paddingVertical: 8,
    },
    expandComposeBox: {
      position: 'absolute',
      right: 10,
      top: 8,
      color: this.context.backgroundColor === 'white' ? 'rgb(201, 201, 201)' : 'gray',
    },
    shrinkComposeBox: {
      color: this.context.backgroundColor === 'white' ? 'rgb(201, 201, 201)' : 'gray',
    },
    botomMenubar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 50,
      backgroundColor: this.context.backgroundColor,
    },
    expandedTopicInput: {
      position: 'relative',
      bottom: -1,
    },
    expandedComposeContainer: {
      backgroundColor: this.context.backgroundColor,
      flexDirection: 'column',
      flex: 1,
    },
    modalTitle: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 50,
      paddingHorizontal: 10,
    },
  };

  submitButtonHitSlop = { top: 8, right: 8, bottom: 8, left: 8 };

  getValidationErrors = (): $ReadOnlyArray<ValidationError> => {
    const { mandatoryTopics } = this.props;
    const destinationNarrow = this.getDestinationNarrow();
    const { message } = this.state;

    const result = [];

    if (
      isTopicNarrow(destinationNarrow)
      && topicOfNarrow(destinationNarrow) === apiConstants.NO_TOPIC_TOPIC
      && mandatoryTopics
    ) {
      result.push('mandatory-topic-empty');
    }

    if (message.trim().length === 0) {
      result.push('message-empty');
    }

    if (this.state.numUploading > 0) {
      result.push('upload-in-progress');
    }

    return result;
  };

  render() {
    const {
      isTopicFocused,
      isMenuExpanded,
      height,
      message,
      topic,
      selection,
      isExpanded,
    } = this.state;
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
      streamsById,
      videoChatProvider,
      _,
    } = this.props;

    const insertVideoCallLink =
      videoChatProvider !== null ? () => this.insertVideoCallLink(videoChatProvider) : null;

    if (!isSubscribed) {
      return <NotSubscribed narrow={narrow} />;
    } else if (isAnnouncementOnly && !isAdmin) {
      return <AnnouncementOnly />;
    }

    const placeholder = getComposeInputPlaceholder(narrow, ownUserId, allUsersById, streamsById);
    const style = {
      paddingBottom: insets.bottom,
      backgroundColor: 'hsla(0, 0%, 50%, 0.1)',
    };

    const SubmitButtonIcon = isEditing ? IconDone : IconSend;
    const submitButtonDisabled = this.getValidationErrors().length > 0;

    return (
      <>
        {isExpanded ? (
          <Modal animationType="slide">
            <View style={this.styles.expandedComposeContainer}>
              <View style={this.styles.expandedWrapper}>
                <View style={this.styles.modalTitle}>
                  <View style={this.styles.messageTitle}>
                    <Text style={{ fontSize: 18 }}>New Message</Text>
                    {/* Hiding the stream name topic name if it is opened in private messages */}
                    {stream.name !== '' ? (
                      <Text style={{ fontSize: 12 }}>{`${stream.name} > ${topic}`}</Text>
                    ) : (
                      <></>
                    )}
                  </View>

                  <IconCompress
                    style={this.styles.shrinkComposeBox}
                    size={20}
                    onPress={() =>
                      this.setState({
                        isExpanded: false,
                      })
                    }
                  />
                </View>

                <MentionWarnings narrow={narrow} stream={stream} ref={this.mentionWarnings} />
                {/* Hiding the topic input if it is opened in private messages */}
                {stream.name !== '' ? (
                  <View style={this.styles.expandedTopicInput}>
                    <TopicAutocomplete
                      isFocused={isTopicFocused}
                      narrow={narrow}
                      text={topic}
                      onAutocomplete={this.handleTopicAutocomplete}
                    />
                    <Text style={{ fontSize: 12, paddingLeft: 5, marginTop: 10 }}> Topic: </Text>
                    <Input
                      style={[
                        this.styles.topicInput,
                        { backgroundColor: this.context.backgroundColor },
                      ]}
                      underlineColorAndroid="transparent"
                      placeholder="Enter topic"
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
                      multiline
                      returnKeyType="next"
                    />
                  </View>
                ) : (
                  <></>
                )}

                <View onLayout={this.handleLayoutChange}>
                  <View style={this.styles.expandedTextInput}>
                    <AutocompleteView
                      isFocused={this.state.isMessageFocused}
                      selection={selection}
                      text={message}
                      onAutocomplete={this.handleMessageAutocomplete}
                    />
                    <Input
                      multiline={!isMenuExpanded}
                      style={[this.styles.composeTextInput]}
                      underlineColorAndroid="transparent"
                      placeholder={placeholder}
                      defaultValue={message}
                      textInputRef={this.messageInputRef}
                      onBlur={this.handleMessageBlur}
                      onChangeText={this.handleMessageChange}
                      onSelectionChange={this.handleMessageSelectionChange}
                      onTouchStart={this.handleInputTouchStart}
                    />
                  </View>
                </View>
              </View>
              <View style={this.styles.botomMenubar}>
                <ComposeMenu
                  iscomposeExpanded
                  destinationNarrow={this.getDestinationNarrow()}
                  expanded
                  insertAttachment={this.insertAttachment}
                  insertVideoCallLink={insertVideoCallLink}
                  onExpandContract={this.handleComposeMenuToggle}
                />
                <View style={this.styles.submitButtonContainer}>
                  <View
                    // Mask the Android ripple-on-touch so it doesn't extend
                    //   outside the circle…
                    // TODO: `Touchable` should do this, and the `hitSlop`
                    //   workaround below.
                    style={{
                      borderRadius: this.styles.submitButton.borderRadius,
                      overflow: 'hidden',
                    }}
                    // …and don't defeat the `Touchable`'s `hitSlop`.
                    hitSlop={this.submitButtonHitSlop}
                  >
                    <Touchable
                      style={[
                        this.styles.submitButton,
                        { opacity: submitButtonDisabled ? 0.25 : 1 },
                      ]}
                      onPress={this.handleSubmit}
                      accessibilityLabel={isEditing ? _('Save message') : _('Send message')}
                      hitSlop={this.submitButtonHitSlop}
                    >
                      <SubmitButtonIcon size={16} color="white" />
                    </Touchable>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
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
                iscomposeExpanded={false}
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
                    !this.getCanSelectTopic() && {
                      position: 'absolute',
                      transform: [{ scale: 0 }],
                    },
                  ]}
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
                <View>
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
                  <IconExpand
                    style={this.styles.expandComposeBox}
                    size={15}
                    onPress={() =>
                      this.setState({
                        isExpanded: true,
                      })
                    }
                  />
                </View>
              </View>
              <View style={this.styles.submitButtonContainer}>
                <View
                  // Mask the Android ripple-on-touch so it doesn't extend
                  //   outside the circle…
                  // TODO: `Touchable` should do this, and the `hitSlop`
                  //   workaround below.
                  style={{
                    borderRadius: this.styles.submitButton.borderRadius,
                    overflow: 'hidden',
                  }}
                  // …and don't defeat the `Touchable`'s `hitSlop`.
                  hitSlop={this.submitButtonHitSlop}
                >
                  <Touchable
                    style={[this.styles.submitButton, { opacity: submitButtonDisabled ? 0.25 : 1 }]}
                    onPress={this.handleSubmit}
                    accessibilityLabel={isEditing ? _('Save message') : _('Send message')}
                    hitSlop={this.submitButtonHitSlop}
                  >
                    <SubmitButtonIcon size={16} color="white" />
                  </Touchable>
                </View>
              </View>
            </View>
          </View>
        )}
      </>
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
    streamsById: getStreamsById(state),
    videoChatProvider: getVideoChatProvider(state),
    mandatoryTopics: getRealm(state).mandatoryTopics,
  })),
  withSafeAreaInsets,
)(withGetText(ComposeBoxInner));

export default ComposeBox;
