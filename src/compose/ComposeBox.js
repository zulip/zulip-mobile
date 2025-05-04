/* @flow strict-local */
import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Platform, View } from 'react-native';
import type { LayoutEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import invariant from 'invariant';
// $FlowFixMe[untyped-import]
import * as fenced_code from '@zulip/shared/lib/fenced_code';

import { usePrevious } from '../reactUtils';
import * as apiConstants from '../api/constants';
import { ThemeContext, BRAND_COLOR, createStyleSheet } from '../styles';
import type {
  Narrow,
  VideoChatProvider,
  Message,
  Outbox,
  Stream,
  UserOrBot,
  GetText,
} from '../types';
import { useSelector, useDispatch } from '../react-redux';
import { TranslationContext } from '../boot/TranslationProvider';
import { draftUpdate, sendTypingStart, sendTypingStop } from '../actions';
import Touchable from '../common/Touchable';
import Input from '../common/Input';
import { showErrorAlert } from '../utils/info';
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
  getOwnUser,
  getStreamInNarrow,
  getStreamsById,
  getVideoChatProvider,
  getRealm,
  getZulipFeatureLevel,
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
import { roleIsAtLeast } from '../permissionSelectors';
import { Role } from '../api/permissionsTypes';
import useUncontrolledInput from '../useUncontrolledInput';
import { tryFetch } from '../message/fetchActions';
import { getMessageUrl } from '../utils/internalLinks';
import * as logging from '../utils/logging';
import type { Attachment } from './ComposeMenu';
import { ApiError, RequestError } from '../api/apiErrors';

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
export type ValidationError =
  | 'upload-in-progress'
  | 'message-empty'
  | 'mandatory-topic-empty'
  | 'quote-and-reply-in-progress';

/**
 * Functions expected to be called using a ref to this component.
 */
export type ImperativeHandle = {|
  /**
   * Take a message ID, fetch its raw Markdown content, and put it in the
   *   compose box with proper formatting.
   */
  +doQuoteAndReply: (message: Message | Outbox) => Promise<void>,
|};

const FOCUS_DEBOUNCE_TIME_MS = 16;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get the quote-and-reply text for a message, with fence and silent mention.
 *
 * Doesn't include any leading or trailing newlines; the caller should do
 * that if desired.
 */
function getQuoteAndReplyText(args: {|
  message: Message | Outbox,
  rawContent: string,
  user: UserOrBot,
  realm: URL,
  streamsById: Map<number, Stream>,
  zulipFeatureLevel: number,
  _: GetText,
|}): string {
  // Modeled on replace_content in static/js/compose_actions.js in the
  // zulip/zulip repo.
  // TODO(shared): Share that code?
  //
  // Result looks like:
  //   @_**Iago|5** [said](link to message):
  //   ```quote
  //   message content
  //   ```

  const { message, rawContent, user, realm, streamsById, zulipFeatureLevel, _ } = args;
  const authorLine = _({
    // Matches the web-app string
    text: '{username} [said]({link_to_message}):',
    values: {
      username: `@_**${user.full_name}|${user.user_id}**`,
      link_to_message: getMessageUrl(realm, message, streamsById, zulipFeatureLevel).toString(),
    },
  });
  const fence = fenced_code.get_unused_fence(rawContent);

  return `\
${authorLine}
${fence}quote
${rawContent}
${fence}`;
}

const ComposeBox: React$AbstractComponent<Props, ImperativeHandle> = forwardRef((props, ref) => {
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
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const ownUserId = useSelector(getOwnUserId);
  const allUsersById = useSelector(getAllUsersById);
  const isAtLeastAdmin = useSelector(state => roleIsAtLeast(getOwnUser(state).role, Role.Admin));
  const isAnnouncementOnly = useSelector(state =>
    getIsActiveStreamAnnouncementOnly(state, props.narrow),
  );
  const isSubscribed = useSelector(state => getIsActiveStreamSubscribed(state, props.narrow));
  const stream = useSelector(state => getStreamInNarrow(state, props.narrow));
  const streamsById = useSelector(getStreamsById);
  const videoChatProvider = useSelector(getVideoChatProvider);
  const { mandatoryTopics, enableGuestUserIndicator } = useSelector(getRealm);

  const mentionWarnings = React.useRef<React$ElementRef<typeof MentionWarnings> | null>(null);

  const inputBlurTimeoutId = useRef<?TimeoutID>(null);

  const [height, setHeight] = useState<number>(20);

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
    }
  }, [dispatch, isEditing, narrow, messageInputState, prevMessageInputState]);

  const updateIsFocused = useCallback(() => {
    setFocusState(state => ({ ...state, either: state.message || state.topic }));
  }, []);

  const topicSelectionAllowed = useMemo(
    () => (isEditing ? isStreamOrTopicNarrow(narrow) : isStreamNarrow(narrow)),
    [isEditing, narrow],
  );

  const topicInputVisible = topicSelectionAllowed && (focusState.either || isEditing);

  /**
   * Inserts text at the message input's cursor position.
   *
   * Selected text is not replaced: selection-start is ignored, and
   * selection-end is taken to be the cursor position.
   *
   * If padWithEmptyLines is true, adds an empty line before (unless cursor
   * is at 0) and after `text`.
   */
  // An earlier version of this function *would* replace selected text,
  // which could be upsetting if you didn't want to lose the selected text.
  const insertMessageTextAtCursorPosition = useCallback(
    (text: string, padWithEmptyLines = false) => {
      setMessageInputValue(state => {
        const cursorPosition = state.selection.end;

        const paddingStart = padWithEmptyLines && cursorPosition !== 0 ? '\n\n' : '';
        const paddingEnd = padWithEmptyLines ? '\n\n' : '';

        return (
          state.value.slice(0, cursorPosition)
          + paddingStart
          + text
          + paddingEnd
          + state.value.slice(cursorPosition)
        );
      });
    },
    [setMessageInputValue],
  );

  const insertVideoCallLink = useCallback(
    (videoChatProvider: VideoChatProvider) => {
      if (videoChatProvider.name === 'jitsi_meet') {
        // This is meant to align with the way the webapp generates jitsi video
        // call IDs. That logic can be found in the ".video_link" click handler
        // in static/js/compose.js.
        const videoCallId = randomInt(100000000000000, 999999999999999);
        const videoCallUrl = `${videoChatProvider.jitsiServerUrl}/${videoCallId}`;
        const linkMessage = _('Click to join video call');
        const linkText = `[${linkMessage}](${videoCallUrl})`;
        insertMessageTextAtCursorPosition(linkText);
      }
    },
    [insertMessageTextAtCursorPosition, _],
  );

  const [numUploading, setNumUploading] = useState<number>(0);
  const insertAttachments = useCallback(
    async (attachments: $ReadOnlyArray<Attachment>) => {
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
            response = await api.uploadFile(auth, attachments[i].url, fileName);
          } catch (errorIllTyped) {
            const error: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470

            if (!(error instanceof Error)) {
              logging.error('ComposeBox: Unexpected non-error thrown');
            }

            let msg = undefined;
            if (
              error instanceof RequestError
              && error.httpStatus === 413 // 413 Payload Too Large:
              //   https://github.com/zulip/zulip-mobile/issues/5148#issuecomment-1092140960
            ) {
              msg = _('The server said the file is too large.');
            } else if (error instanceof ApiError) {
              msg = _('The server said:\n\n{errorMessage}', { errorMessage: error.message });
            } else if (error instanceof Error && error.message.length > 0) {
              msg = error.message;
            }
            showErrorAlert(_('Failed to upload file: {fileName}', { fileName }), msg);

            setMessageInputValue(state =>
              state.value.replace(
                placeholder,
                () => `[${_('Failed to upload file: {fileName}', { fileName })}]()`,
              ),
            );
            continue;
          }

          const linkText = `[${fileName}](${response.uri})`;
          setMessageInputValue(state =>
            state.value.indexOf(placeholder) !== -1
              ? state.value.replace(placeholder, () => linkText)
              : `${state.value}\n${linkText}`,
          );
        }
      } finally {
        setNumUploading(n => n - 1);
      }
    },
    [insertMessageTextAtCursorPosition, _, auth, setMessageInputValue],
  );

  const activeInvocations = useRef<number[]>([]);
  const [activeQuoteAndRepliesCount, setActiveQuoteAndRepliesCount] = useState(0);
  const anyQuoteAndReplyInProgress = activeQuoteAndRepliesCount > 0;
  const doQuoteAndReply = useCallback(
    async message => {
      // TODO: For composing a new message (i.e. isEditing is false), if
      //   not already there, re-narrow to `message`'s conversation narrow,
      //   with getNarrowForReply, and do the quote-and-reply there.
      //   Discussion:
      //   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/.23M1975.20Quote.20and.20reply/near/1455302

      setActiveQuoteAndRepliesCount(v => v + 1);
      const serialNumber =
        activeInvocations.current.length > 0
          ? activeInvocations.current[activeInvocations.current.length - 1] + 1
          : 0;
      activeInvocations.current.push(serialNumber);
      try {
        const user = allUsersById.get(message.sender_id);
        if (!user) {
          showErrorAlert(_('Quote-and-reply failed'));
          logging.error('Missing user for sender_id in quote-and-reply', {
            sender_id: message.sender_id,
          });
          return;
        }

        // Set to match quoting_placeholder in quote_and_reply in
        // static/js/compose_actions.js in the zulip/zulip repo.
        const quotingPlaceholder =
          serialNumber > 0
            ? _({ text: '[Quoting ({serialNumber})…]', values: { serialNumber } })
            : _('[Quoting…]');
        insertMessageTextAtCursorPosition(quotingPlaceholder, true);

        let rawContent = undefined;
        try {
          // TODO: Give feedback when the server round trip takes longer than
          //   expected.
          // TODO: Let the user cancel the request so we don't force a
          //   quote-and-reply after they've given up and perhaps forgotten
          //   about it.
          rawContent = await tryFetch(() =>
            api.getRawMessageContent(auth, { message_id: message.id }, zulipFeatureLevel),
          );
        } catch {
          showErrorAlert(_('Quote-and-reply failed'));
          return;
        }

        if (topicSelectionAllowed && topicInputState.value === '' && message.type === 'stream') {
          // Later, this won't be necessary in the case of composing a new
          // message. See TODO above about re-narrowing to `message`'s
          // conversation.
          setTopicInputValue(message.subject);
        }
        const quoteAndReplyText = getQuoteAndReplyText({
          message,
          rawContent,
          user,
          realm: auth.realm,
          streamsById,
          zulipFeatureLevel,
          _,
        });
        setMessageInputValue(state =>
          state.value.replace(quotingPlaceholder, () => quoteAndReplyText),
        );
        messageInputRef.current?.focus();
      } finally {
        setActiveQuoteAndRepliesCount(v => v - 1);
        activeInvocations.current = activeInvocations.current.filter(x => x !== serialNumber);
      }
    },
    [
      auth,
      allUsersById,
      streamsById,
      insertMessageTextAtCursorPosition,
      setMessageInputValue,
      zulipFeatureLevel,
      _,
      topicSelectionAllowed,
      topicInputState.value,
      setTopicInputValue,
      messageInputRef,
    ],
  );
  useImperativeHandle(ref, () => ({ doQuoteAndReply }), [doQuoteAndReply]);

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
    setFocusState(state => ({ ...state, message: true, either: true }));
    if (
      !isEditing
      && isStreamNarrow(narrow)
      && !focusState.either // not affected by setFocusState above; React state is set asynchronously
      && topicInputState.value === ''
    ) {
      // We weren't showing the topic input when the user tapped on the input
      // to focus it, but we're about to show it.  Focus that, if the user
      // hasn't already selected a topic.
      topicInputRef.current?.focus();
    }
  }, [isEditing, narrow, focusState.either, topicInputState.value, topicInputRef]);

  const handleMessageBlur = useCallback(() => {
    setFocusState(state => ({ ...state, message: false }));
    dispatch(sendTypingStop(narrow));
    // give a chance to the topic input to get the focus
    clearTimeout(inputBlurTimeoutId.current);
    inputBlurTimeoutId.current = setTimeout(updateIsFocused, FOCUS_DEBOUNCE_TIME_MS);
  }, [dispatch, narrow, updateIsFocused]);

  const handleTopicFocus = useCallback(() => {
    setFocusState(state => ({ ...state, topic: true, either: true }));
  }, []);

  const handleTopicBlur = useCallback(() => {
    setFocusState(state => ({ ...state, topic: false }));
    // give a chance to the message input to get the focus
    clearTimeout(inputBlurTimeoutId.current);
    inputBlurTimeoutId.current = setTimeout(updateIsFocused, FOCUS_DEBOUNCE_TIME_MS);
  }, [updateIsFocused]);

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

    if (messageInputValue.trim().length === 0 && !isEditing) {
      result.push('message-empty');
    }

    if (numUploading > 0) {
      result.push('upload-in-progress');
    }

    if (anyQuoteAndReplyInProgress) {
      result.push('quote-and-reply-in-progress');
    }

    return result;
  }, [
    destinationNarrow,
    mandatoryTopics,
    numUploading,
    anyQuoteAndReplyInProgress,
    messageInputState,
    isEditing,
  ]);

  const submitButtonDisabled = validationErrors.length > 0;

  const handleSubmit = useCallback(() => {
    const { value: messageInputValue } = messageInputState;

    if (validationErrors.length > 0) {
      const msg = validationErrors
        .map(error => {
          switch (error) {
            case 'upload-in-progress':
              return _('Please wait for the upload to complete.');
            case 'quote-and-reply-in-progress':
              return _('Please wait for the quote-and-reply to complete.');
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
        composeInputs: {
          flex: 1,
          paddingTop: 8,
          paddingLeft: 8,
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
          // These border attributes override styles set in <Input />.
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
          ...(!topicInputVisible && { position: 'absolute', transform: [{ scale: 0 }] }),
        },
        composeTextInput: {
          // These border attributes override styles set in <Input />.
          borderWidth: 0,
          borderRadius: 5,

          fontSize: 15,
          flexShrink: 1,
          ...inputMarginPadding,
          backgroundColor,
        },
      }),
    [inputMarginPadding, backgroundColor, height, submitButtonDisabled, topicInputVisible],
  );

  const submitButtonHitSlop = useMemo(() => ({ top: 8, right: 8, bottom: 8, left: 8 }), []);

  const { value: messageInputValue, selection: messageInputSelection } = messageInputState;

  if (!isSubscribed) {
    return <NotSubscribed narrow={narrow} />;
  } else if (isAnnouncementOnly && !isAtLeastAdmin) {
    return <AnnouncementOnly />;
  }

  const placeholder = getComposeInputPlaceholder(
    narrow,
    ownUserId,
    allUsersById,
    streamsById,
    enableGuestUserIndicator,
    _,
  );

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
        // When the keyboard is open, this bottom padding is compensated
        // for: we pass KeyboardAvoider's compensateOverpadding prop.
        edges={['bottom']}
        style={styles.composeBox}
        onLayout={handleLayoutChange}
      >
        <View style={styles.composeInputs}>
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
            onSubmitEditing={() => messageInputRef.current?.focus()}
            blurOnSubmit={false}
            returnKeyType="next"
          />
          <Input
            multiline
            style={styles.composeTextInput}
            underlineColorAndroid="transparent"
            placeholder={placeholder}
            defaultValue={messageInputValue}
            autoFocus={autoFocusMessage}
            textInputRef={messageInputRef}
            {...messageInputCallbacks}
            onBlur={handleMessageBlur}
            onFocus={handleMessageFocus}
          />
          <ComposeMenu
            destinationNarrow={destinationNarrow}
            insertAttachments={insertAttachments}
            insertVideoCallLink={
              videoChatProvider !== null ? () => insertVideoCallLink(videoChatProvider) : null
            }
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
});

export default ComposeBox;
