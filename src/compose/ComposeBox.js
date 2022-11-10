/* @flow strict-local */
import React, { useContext, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { Node } from 'react';
import { Platform, View } from 'react-native';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import type { LayoutEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import invariant from 'invariant';

import { usePrevious } from '../reactUtils';
import * as apiConstants from '../api/constants';
import { ThemeContext, BRAND_COLOR, createStyleSheet } from '../styles';
import type { Narrow, VideoChatProvider } from '../types';
import { useSelector, useDispatch } from '../react-redux';
import { TranslationContext } from '../boot/TranslationProvider';
import { draftUpdate, sendTypingStart, sendTypingStop } from '../actions';
import Touchable from '../common/Touchable';
import Input from '../common/Input';
import { showToast, showErrorAlert } from '../utils/info';
import { IconDone, IconSend } from '../common/Icons';
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
import { getOwnUserRole, roleIsAtLeast } from '../permissionSelectors';
import { Role } from '../api/permissionsTypes';
import useUncontrolledInput from '../useUncontrolledInput';

/* eslint-disable no-shadow */

type Props = $ReadOnly<{|
  /** The narrow shown in the message list.  Must be a conversation or stream. */
  // In particular `destinationNarrow` makes assumptions about the narrow
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

// TODO(?): Could deduplicate with this type in ShareWrapper.
export type ValidationError = 'upload-in-progress' | 'message-empty' | 'mandatory-topic-empty';

const FOCUS_DEBOUNCE_TIME_MS = 16;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function ComposeBox(props: Props): Node {
  const {
    narrow,
    onSend,
    isEditing,
    initialMessage,
    initialTopic,
    autoFocusTopic,
    autoFocusMessage,
  } = props;

  const _ = useContext(TranslationContext);

  const dispatch = useDispatch();
  const auth = useSelector(getAuth);
  const ownUserId = useSelector(getOwnUserId);
  const allUsersById = useSelector(getAllUsersById);
  const isAtLeastAdmin = useSelector(state => roleIsAtLeast(getOwnUserRole(state), Role.Admin));
  const isAnnouncementOnly = useSelector(state =>
    getIsActiveStreamAnnouncementOnly(state, props.narrow),
  );
  const isSubscribed = useSelector(state => getIsActiveStreamSubscribed(state, props.narrow));
  const stream = useSelector(state => getStreamInNarrow(state, props.narrow));
  const streamsById = useSelector(getStreamsById);
  const videoChatProvider = useSelector(getVideoChatProvider);
  const mandatoryTopics = useSelector(state => getRealm(state).mandatoryTopics);

  const mentionWarnings = React.useRef<React$ElementRef<typeof MentionWarnings> | null>(null);

  const inputBlurTimeoutId = useRef<?TimeoutID>(null);

  // TODO(#5141): Encapsulate this in a nice, plain action-sheet pattern
  //   instead of setting it all over the place
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(false);

  const [height, setHeight] = useState<number>(20);
  const [numUploading, setNumUploading] = useState<number>(0);

  const [focusState, setFocusState] = useState<{|
    message: boolean,
    topic: boolean,

    /** Almost the same as message || topic ... except debounced, to stay
     * true while those flip from false/true to true/false and back. */
    either: boolean,
  |}>({
    message: false,
    topic: false,
    either: false,
  });

  const [
    topicInputRef,
    topicInputState,
    setTopicInputValue,
    setTopicInputSelection /* eslint-disable-line no-unused-vars */,
    topicInputCallbacks,
  ] = useUncontrolledInput({
    value: initialTopic ?? (isTopicNarrow(narrow) ? topicOfNarrow(narrow) : ''),
  });

  const [
    messageInputRef,
    messageInputState,
    setMessageInputValue,
    setMessageInputSelection /* eslint-disable-line no-unused-vars */,
    messageInputCallbacks,
  ] = useUncontrolledInput({ value: initialMessage ?? '', selection: { start: 0, end: 0 } });

  useEffect(
    () => () => {
      clearTimeout(inputBlurTimeoutId.current);
      inputBlurTimeoutId.current = null;
    },
    [],
  );

  const prevMessageInputState = usePrevious(messageInputState);
  useEffect(() => {
    const messageInputValue = messageInputState.value;
    const prevMessageInputValue = prevMessageInputState?.value;

    if (prevMessageInputValue !== messageInputValue) {
      if (messageInputValue.length === 0) {
        dispatch(sendTypingStop(narrow));
      } else {
        dispatch(sendTypingStart(narrow));
      }
      if (!isEditing) {
        dispatch(draftUpdate(narrow, messageInputValue));
      }
      setIsMenuExpanded(false);
    }
  }, [dispatch, isEditing, narrow, messageInputState, prevMessageInputState]);

  const prevTopicInputState = usePrevious(topicInputState);
  useEffect(() => {
    const topicInputValue = topicInputState.value;
    const prevTopicInputValue = prevTopicInputState?.value;

    if (prevTopicInputValue !== topicInputValue) {
      setIsMenuExpanded(false);
    }
  }, [topicInputState, prevTopicInputState]);

  const updateIsFocused = useCallback(() => {
    setFocusState(state => ({ ...state, either: state.message || state.topic }));
  }, []);

  const canSelectTopic = useMemo(() => {
    if (isEditing) {
      return isStreamOrTopicNarrow(narrow);
    }
    if (!isStreamNarrow(narrow)) {
      return false;
    }
    return focusState.either;
  }, [isEditing, narrow, focusState.either]);

  const insertMessageTextAtCursorPosition = useCallback(
    (text: string) => {
      setMessageInputValue(
        state =>
          state.value.slice(0, state.selection.start)
          + text
          + state.value.slice(state.selection.end, state.value.length),
      );
    },
    [setMessageInputValue],
  );

  const insertVideoCallLinkAtCursorPosition = useCallback(
    (url: string) => {
      const linkMessage = _('Click to join video call');
      const linkText = `[${linkMessage}](${url})`;

      insertMessageTextAtCursorPosition(linkText);
    },
    [insertMessageTextAtCursorPosition, _],
  );

  const insertVideoCallLink = useCallback(
    (videoChatProvider: VideoChatProvider) => {
      if (videoChatProvider.name === 'jitsi_meet') {
        // This is meant to align with the way the webapp generates jitsi video
        // call IDs. That logic can be found in the ".video_link" click handler
        // in static/js/compose.js.
        const videoCallId = randomInt(100000000000000, 999999999999999);
        const videoCallUrl = `${videoChatProvider.jitsiServerUrl}/${videoCallId}`;
        insertVideoCallLinkAtCursorPosition(videoCallUrl);
      }
    },
    [insertVideoCallLinkAtCursorPosition],
  );

  const insertAttachment = useCallback(
    async (attachments: $ReadOnlyArray<DocumentPickerResponse>) => {
      setNumUploading(n => n + 1);
      try {
        const fileNames: string[] = [];
        const placeholders: string[] = [];
        for (let i = 0; i < attachments.length; i++) {
          const fileName = attachments[i].name ?? _('Attachment {num}', { num: i + 1 });
          fileNames.push(fileName);
          const placeholder = `[${_('Uploading {fileName}...', { fileName })}]()`;
          placeholders.push(placeholder);
        }
        insertMessageTextAtCursorPosition(placeholders.join('\n\n'));

        for (let i = 0; i < attachments.length; i++) {
          const fileName = fileNames[i];
          const placeholder = placeholders[i];
          let response = null;
          try {
            response = await api.uploadFile(auth, attachments[i].uri, fileName);
          } catch {
            showToast(_('Failed to upload file: {fileName}', { fileName }));
            setMessageInputValue(state =>
              state.value.replace(
                placeholder,
                `[${_('Failed to upload file: {fileName}', { fileName })}]()`,
              ),
            );
            continue;
          }

          const linkText = `[${fileName}](${response.uri})`;
          setMessageInputValue(state =>
            state.value.indexOf(placeholder) !== -1
              ? state.value.replace(placeholder, linkText)
              : `${state.value}\n${linkText}`,
          );
        }
      } finally {
        setNumUploading(n => n - 1);
      }
    },
    [insertMessageTextAtCursorPosition, _, auth, setMessageInputValue],
  );

  const handleComposeMenuToggle = useCallback(() => {
    setIsMenuExpanded(x => !x);
  }, []);

  const handleLayoutChange = useCallback((event: LayoutEvent) => {
    setHeight(event.nativeEvent.layout.height);
  }, []);

  const handleTopicAutocomplete = useCallback(
    (topic: string) => {
      setTopicInputValue(topic);
      messageInputRef.current?.focus();
    },
    [setTopicInputValue, messageInputRef],
  );

  // See JSDoc on 'onAutocomplete' in 'AutocompleteView.js'.
  const handleMessageAutocomplete = useCallback(
    (completedText: string, completion: string, lastWordPrefix: string) => {
      setMessageInputValue(completedText);

      if (lastWordPrefix === '@') {
        mentionWarnings.current?.handleMentionSubscribedCheck(completion);
      }
    },
    [setMessageInputValue],
  );

  const handleMessageFocus = useCallback(() => {
    if (
      !isEditing
      && isStreamNarrow(narrow)
      && !focusState.either
      && topicInputState.value === ''
    ) {
      // We weren't showing the topic input when the user tapped on the input
      // to focus it, but we're about to show it.  Focus that, if the user
      // hasn't already selected a topic.
      topicInputRef.current?.focus();
    } else {
      setFocusState(state => ({ ...state, message: true, either: true }));
      setIsMenuExpanded(false);
    }
  }, [isEditing, narrow, focusState.either, topicInputState.value, topicInputRef]);

  const handleMessageBlur = useCallback(() => {
    setFocusState(state => ({ ...state, message: false }));
    setIsMenuExpanded(false);
    dispatch(sendTypingStop(narrow));
    // give a chance to the topic input to get the focus
    clearTimeout(inputBlurTimeoutId.current);
    inputBlurTimeoutId.current = setTimeout(updateIsFocused, FOCUS_DEBOUNCE_TIME_MS);
  }, [dispatch, narrow, updateIsFocused]);

  const handleTopicFocus = useCallback(() => {
    setFocusState(state => ({ ...state, topic: true, either: true }));
    setIsMenuExpanded(false);
  }, []);

  const handleTopicBlur = useCallback(() => {
    setFocusState(state => ({ ...state, topic: false }));
    setIsMenuExpanded(false);
    // give a chance to the message input to get the focus
    clearTimeout(inputBlurTimeoutId.current);
    inputBlurTimeoutId.current = setTimeout(updateIsFocused, FOCUS_DEBOUNCE_TIME_MS);
  }, [updateIsFocused]);

  const handleInputTouchStart = useCallback(() => {
    setIsMenuExpanded(false);
  }, []);

  const destinationNarrow = useMemo(() => {
    if (isStreamNarrow(narrow) || (isTopicNarrow(narrow) && isEditing)) {
      const streamId = streamIdOfNarrow(narrow);
      const topic = topicInputState.value.trim() || apiConstants.kNoTopicTopic;
      return topicNarrow(streamId, topic);
    }
    invariant(isConversationNarrow(narrow), 'destination narrow must be conversation');
    return narrow;
  }, [isEditing, narrow, topicInputState.value]);

  const validationErrors: $ReadOnlyArray<ValidationError> = useMemo(() => {
    const { value: messageInputValue } = messageInputState;

    const result = [];

    if (
      isTopicNarrow(destinationNarrow)
      && topicOfNarrow(destinationNarrow) === apiConstants.kNoTopicTopic
      && mandatoryTopics
    ) {
      result.push('mandatory-topic-empty');
    }

    if (messageInputValue.trim().length === 0) {
      result.push('message-empty');
    }

    if (numUploading > 0) {
      result.push('upload-in-progress');
    }

    return result;
  }, [destinationNarrow, mandatoryTopics, numUploading, messageInputState]);

  const submitButtonDisabled = validationErrors.length > 0;

  const handleSubmit = useCallback(() => {
    const { value: messageInputValue } = messageInputState;

    if (validationErrors.length > 0) {
      const msg = validationErrors
        .map(error => {
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

    onSend(messageInputValue, destinationNarrow);

    setMessageInputValue('');

    if (mentionWarnings.current) {
      mentionWarnings.current.clearMentionWarnings();
    }

    dispatch(sendTypingStop(destinationNarrow));
  }, [
    destinationNarrow,
    validationErrors,
    _,
    dispatch,
    isEditing,
    onSend,
    setMessageInputValue,
    messageInputState,
  ]);

  const inputMarginPadding = useMemo(
    () => ({
      paddingHorizontal: 8,
      paddingVertical: Platform.select({
        ios: 8,
        android: 2,
      }),
    }),
    [],
  );

  const { backgroundColor } = useContext(ThemeContext);
  const styles = useMemo(
    () =>
      createStyleSheet({
        wrapper: {
          flexShrink: 1,
          maxHeight: '60%',
        },
        autocompleteWrapper: {
          position: 'absolute',
          bottom: 0,
          width: '100%',
          marginBottom: height,
        },
        composeBox: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          flexShrink: 1,
          backgroundColor: 'hsla(0, 0%, 50%, 0.1)',
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
          opacity: submitButtonDisabled ? 0.25 : 1,
        },
        topicInput: {
          borderWidth: 0,
          borderRadius: 5,
          marginBottom: 8,
          ...inputMarginPadding,
          backgroundColor,

          // This is a really dumb hack to work around
          // https://github.com/facebook/react-native/issues/16405.
          // Someone suggests in that thread that { position: absolute,
          // zIndex: -1 } will work, which it does not (the border of the
          // TextInput is still visible, even with very negative zIndex
          // values). Someone else suggests { transform: [{scale: 0}] }
          // (https://stackoverflow.com/a/49817873), which doesn't work
          // either. However, a combinarion of the two of them seems to
          // work.
          ...(!canSelectTopic && { position: 'absolute', transform: [{ scale: 0 }] }),
        },
        composeTextInput: {
          borderWidth: 0,
          borderRadius: 5,
          fontSize: 15,
          flexShrink: 1,
          ...inputMarginPadding,
          backgroundColor,
        },
      }),
    [inputMarginPadding, backgroundColor, height, submitButtonDisabled, canSelectTopic],
  );

  const submitButtonHitSlop = useMemo(() => ({ top: 8, right: 8, bottom: 8, left: 8 }), []);

  const { value: messageInputValue, selection: messageInputSelection } = messageInputState;

  if (!isSubscribed) {
    return <NotSubscribed narrow={narrow} />;
  } else if (isAnnouncementOnly && !isAtLeastAdmin) {
    return <AnnouncementOnly />;
  }

  const placeholder = getComposeInputPlaceholder(narrow, ownUserId, allUsersById, streamsById);

  const SubmitButtonIcon = isEditing ? IconDone : IconSend;

  return (
    <View style={styles.wrapper}>
      <MentionWarnings narrow={narrow} stream={stream} ref={mentionWarnings} />
      <View style={styles.autocompleteWrapper}>
        <TopicAutocomplete
          isFocused={focusState.topic}
          narrow={narrow}
          text={topicInputState.value}
          onAutocomplete={handleTopicAutocomplete}
        />
        <AutocompleteView
          isFocused={focusState.message}
          selection={messageInputSelection}
          text={messageInputValue}
          onAutocomplete={handleMessageAutocomplete}
          destinationNarrow={destinationNarrow}
        />
      </View>
      <SafeAreaView
        mode="padding"
        edges={['bottom']}
        style={styles.composeBox}
        onLayout={handleLayoutChange}
      >
        <ComposeMenu
          destinationNarrow={destinationNarrow}
          expanded={isMenuExpanded}
          insertAttachment={insertAttachment}
          insertVideoCallLink={
            videoChatProvider !== null ? () => insertVideoCallLink(videoChatProvider) : null
          }
          onExpandContract={handleComposeMenuToggle}
        />
        <View style={styles.composeText}>
          <Input
            style={styles.topicInput}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            placeholder="Topic"
            defaultValue={topicInputState.value}
            autoFocus={autoFocusTopic}
            selectTextOnFocus
            textInputRef={topicInputRef}
            {...topicInputCallbacks}
            onFocus={handleTopicFocus}
            onBlur={handleTopicBlur}
            onTouchStart={handleInputTouchStart}
            onSubmitEditing={() => messageInputRef.current?.focus()}
            blurOnSubmit={false}
            returnKeyType="next"
          />
          <Input
            // TODO(#5291): Don't switch between true/false for multiline
            multiline={!isMenuExpanded}
            style={styles.composeTextInput}
            underlineColorAndroid="transparent"
            placeholder={placeholder}
            defaultValue={messageInputValue}
            autoFocus={autoFocusMessage}
            textInputRef={messageInputRef}
            {...messageInputCallbacks}
            onBlur={handleMessageBlur}
            onFocus={handleMessageFocus}
            onTouchStart={handleInputTouchStart}
          />
        </View>
        <View style={styles.submitButtonContainer}>
          <View
            // Mask the Android ripple-on-touch so it doesn't extend
            //   outside the circle…
            // TODO: `Touchable` should do this, and the `hitSlop`
            //   workaround below.
            style={{
              borderRadius: styles.submitButton.borderRadius,
              overflow: 'hidden',
            }}
            // …and don't defeat the `Touchable`'s `hitSlop`.
            hitSlop={submitButtonHitSlop}
          >
            <Touchable
              style={styles.submitButton}
              onPress={handleSubmit}
              accessibilityLabel={isEditing ? _('Save message') : _('Send message')}
              hitSlop={submitButtonHitSlop}
            >
              <SubmitButtonIcon size={16} color="white" />
            </Touchable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
