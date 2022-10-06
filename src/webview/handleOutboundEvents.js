/* @flow strict-local */
import { Clipboard, Alert } from 'react-native';

import * as api from '../api';
import config from '../config';
import type { UserId } from '../types';
import type { JSONableDict } from '../utils/jsonable';
import { showErrorAlert, showToast } from '../utils/info';
import { pmKeyRecipientsFromMessage } from '../utils/recipient';
import { isUrlAnImage, tryParseUrl } from '../utils/url';
import * as logging from '../utils/logging';
import { filterUnreadMessagesInRange } from '../utils/unread';
import { parseNarrow } from '../utils/narrow';
import { fetchOlder, fetchNewer, doNarrow, messageLinkPress } from '../actions';
import {
  showTopicActionSheet,
  showPmConversationActionSheet,
  showMessageActionSheet,
} from '../action-sheets';
import { ensureUnreachable } from '../types';
import { base64Utf8Decode } from '../utils/encoding';
import type { Props } from './MessageList';
import type { AppNavigationMethods } from '../nav/AppNavigator';

type WebViewOutboundEventReady = {|
  type: 'ready',
|};

// The user scrolled in the message list, or we pretended they did.  We may
// need to fetch more messages, or mark some messages as read.
type WebViewOutboundEventScroll = {|
  type: 'scroll',

  // The height (in logical pixels?) of the entire message list document
  // this scroll event happened in.
  offsetHeight: number,
  // The height (in logical pixels?) of the visible portion of the message
  // list document.
  innerHeight: number,
  // The vertical offset (in logical pixels?) from the top of the message list
  // document to the top of the visible portion, following this scroll event.
  scrollY: number,

  // The earliest message ID of all those in view either before or after
  // this scroll event.
  startMessageId: number,
  // The latest message ID of all those in view either before or after
  // this scroll event.
  endMessageId: number,
|};

type WebViewOutboundEventRequestUserProfile = {|
  type: 'request-user-profile',
  fromUserId: UserId,
|};

type WebViewOutboundEventNarrow = {|
  type: 'narrow',
  // The result of `keyFromNarrow`, passed through `base64Utf8Encode`.
  // Pass it through `base64UtfDecode` before using.
  narrow: string,
|};

type WebViewOutboundEventImage = {|
  type: 'image',
  src: string,
  messageId: number,
|};

type WebViewOutboundEventReaction = {|
  type: 'reaction',
  messageId: number,
  name: string,
  code: string,
  reactionType: string,
  voted: boolean,
|};

type WebViewOutboundEventUrl = {|
  type: 'url',
  href: string,
  messageId: number,
|};

type WebViewOutboundEventLongPress = {|
  type: 'longPress',
  target: 'message' | 'header' | 'link',
  messageId: number,
  href: string | null,
|};

type WebViewOutboundEventDebug = {|
  type: 'debug',
|};

type WebViewOutboundEventWarn = {|
  type: 'warn',
  details: JSONableDict,
|};

type WebViewOutboundEventError = {|
  type: 'error',
  details: {|
    message: string,
    source: string,
    line: number,
    column: number,
    userAgent: string,
    error: Error,
  |},
|};

type WebViewOutboundEventReactionDetails = {|
  type: 'reactionDetails',
  messageId: number,
  reactionName: string,
|};

type WebViewOutboundEventMention = {|
  type: 'mention',
  userId: UserId,
|};

type WebViewOutboundEventTimeDetails = {|
  type: 'time',
  originalText: string,
|};

type WebViewOutboundEventVote = {|
  type: 'vote',
  messageId: number,
  key: string,
  vote: number,
|};

export type WebViewOutboundEvent =
  | WebViewOutboundEventReady
  | WebViewOutboundEventScroll
  | WebViewOutboundEventRequestUserProfile
  | WebViewOutboundEventNarrow
  | WebViewOutboundEventImage
  | WebViewOutboundEventReaction
  | WebViewOutboundEventUrl
  | WebViewOutboundEventLongPress
  | WebViewOutboundEventReactionDetails
  | WebViewOutboundEventDebug
  | WebViewOutboundEventWarn
  | WebViewOutboundEventError
  | WebViewOutboundEventMention
  | WebViewOutboundEventTimeDetails
  | WebViewOutboundEventVote;

const fetchMore = (props: Props, event: WebViewOutboundEventScroll) => {
  const { innerHeight, offsetHeight, scrollY } = event;
  const { dispatch, narrow } = props;
  if (scrollY < config.messageListThreshold) {
    dispatch(fetchOlder(narrow));
  }
  if (innerHeight + scrollY >= offsetHeight - config.messageListThreshold) {
    dispatch(fetchNewer(narrow));
  }
};

const markRead = (props: Props, event: WebViewOutboundEventScroll) => {
  const { flags, auth } = props.backgroundData;
  if (props.doNotMarkMessagesAsRead) {
    return;
  }
  const unreadMessageIds = filterUnreadMessagesInRange(
    props.messages,
    flags,
    event.startMessageId,
    event.endMessageId,
  );
  api.queueMarkAsRead(auth, unreadMessageIds);
};

/**
 * Handle tapping an image or link for which we want to open the lightbox.
 */
const handleImage = (
  props: Props,
  navigation: AppNavigationMethods,
  src: string,
  messageId: number,
) => {
  const { _ } = props;

  const parsedSrc = tryParseUrl(src, props.backgroundData.auth.realm);
  if (!parsedSrc) {
    showErrorAlert(_('Cannot open image'), _('Invalid image URL.'));
    return;
  }

  const message = props.messages.find(x => x.id === messageId);
  if (message && message.isOutbox !== true) {
    navigation.push('lightbox', { src: parsedSrc, message });
  }
};

const handleLongPress = (args: {|
  props: Props,
  target: 'message' | 'header' | 'link',
  messageId: number,
  href: string | null,
  navigation: AppNavigationMethods,
|}) => {
  const { props, target, messageId, href, navigation } = args;

  if (href !== null) {
    const url = new URL(href, props.backgroundData.auth.realm).toString();
    Clipboard.setString(url);
    const { _ } = props;
    showToast(_('Link copied'));
    return;
  }

  const message = props.messages.find(x => x.id === messageId);
  if (!message) {
    return;
  }
  const {
    dispatch,
    showActionSheetWithOptions,
    backgroundData,
    narrow,
    startEditMessage,
    setDoNotMarkMessagesAsRead,
    composeBoxRef,
    _,
  } = props;
  if (target === 'header') {
    if (message.type === 'stream') {
      showTopicActionSheet({
        showActionSheetWithOptions,
        callbacks: { dispatch, navigation, _ },
        backgroundData,
        streamId: message.stream_id,
        topic: message.subject,
      });
    } else if (message.type === 'private') {
      showPmConversationActionSheet({
        showActionSheetWithOptions,
        callbacks: { navigation, _ },
        backgroundData,
        pmKeyRecipients: pmKeyRecipientsFromMessage(message, backgroundData.ownUser.user_id),
      });
    }
  } else if (target === 'message') {
    showMessageActionSheet({
      showActionSheetWithOptions,
      callbacks: {
        dispatch,
        startEditMessage,
        setDoNotMarkMessagesAsRead,

        // The immutable `.current` value, not the mutable ref object, so
        // that an action-sheet button press will act on values that were
        // current when the action sheet was opened:
        //   https://github.com/zulip/zulip-mobile/pull/5554#discussion_r1027004559
        composeBoxRefCurrent: composeBoxRef.current,

        navigation,
        _,
      },
      backgroundData,
      message,
      narrow,
    });
  }
};

export const handleWebViewOutboundEvent = (
  props: Props,
  navigation: AppNavigationMethods,
  event: WebViewOutboundEvent,
) => {
  switch (event.type) {
    case 'ready':
      // handled by caller
      break;

    case 'scroll':
      fetchMore(props, event);
      markRead(props, event);
      break;

    case 'request-user-profile': {
      navigation.push('account-details', { userId: event.fromUserId });
      break;
    }

    case 'narrow':
      props.dispatch(doNarrow(parseNarrow(base64Utf8Decode(event.narrow))));
      break;

    case 'image':
      handleImage(props, navigation, event.src, event.messageId);
      break;

    case 'longPress':
      handleLongPress({
        props,
        target: event.target,
        messageId: event.messageId,
        href: event.href,
        navigation,
      });
      break;

    case 'url':
      if (isUrlAnImage(event.href)) {
        handleImage(props, navigation, event.href, event.messageId);
      } else {
        props.dispatch(messageLinkPress(event.href));
      }
      break;

    case 'reaction':
      {
        const { code, messageId, name, reactionType, voted } = event;
        const { auth } = props.backgroundData;
        if (voted) {
          api.emojiReactionRemove(auth, messageId, reactionType, code, name);
        } else {
          api.emojiReactionAdd(auth, messageId, reactionType, code, name);
        }
      }
      break;

    case 'reactionDetails':
      {
        const { messageId, reactionName } = event;
        navigation.push('message-reactions', { messageId, reactionName });
      }
      break;

    case 'mention': {
      navigation.push('account-details', { userId: event.userId });
      break;
    }

    case 'time': {
      const { _ } = props;
      const alertText = _('This time is in your timezone. Original text was “{originalText}”.', {
        originalText: event.originalText,
      });
      Alert.alert('', alertText);
      break;
    }

    case 'vote': {
      api.sendSubmessage(
        props.backgroundData.auth,
        event.messageId,
        JSON.stringify({
          type: 'vote',
          key: event.key,
          vote: event.vote,
        }),
      );
      break;
    }

    case 'debug':
      console.debug(props, event); // eslint-disable-line
      break;

    case 'warn':
      logging.warn('WebView warning', event.details);
      break;

    case 'error': {
      const { error, ...rest } = event.details;
      logging.error(error, rest);
      break;
    }

    default:
      ensureUnreachable(event);
      logging.error(`WebView event of unknown type: ${event.type}`);
      break;
  }
};
