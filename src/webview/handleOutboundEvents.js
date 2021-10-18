/* @flow strict-local */
import { Clipboard, Alert } from 'react-native';

import * as NavigationService from '../nav/NavigationService';
import * as api from '../api';
import config from '../config';
import type { Dispatch, GetText, Message, Narrow, Outbox, EditMessage, UserId } from '../types';
import type { BackgroundData } from './MessageList';
import type { ShowActionSheetWithOptions } from '../action-sheets';
import type { JSONableDict } from '../utils/jsonable';
import { showToast } from '../utils/info';
import { pmUiRecipientsFromMessage } from '../utils/recipient';
import { isUrlAnImage } from '../utils/url';
import * as logging from '../utils/logging';
import { filterUnreadMessagesInRange } from '../utils/unread';
import { parseNarrow } from '../utils/narrow';
import {
  fetchOlder,
  fetchNewer,
  navigateToAccountDetails,
  navigateToMessageReactionScreen,
  doNarrow,
  navigateToLightbox,
  messageLinkPress,
} from '../actions';
import { showTopicActionSheet, showMessageActionSheet } from '../action-sheets';
import { ensureUnreachable } from '../types';
import { base64Utf8Decode } from '../utils/encoding';

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

// TODO: Consider completing this and making it exact, once
// `MessageList`'s props are type-checked.
type Props = $ReadOnly<{
  backgroundData: BackgroundData,
  dispatch: Dispatch,
  messages: $ReadOnlyArray<Message | Outbox>,
  narrow: Narrow,
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  startEditMessage: (editMessage: EditMessage) => void,
  ...
}>;

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
  const { doNotMarkMessagesAsRead, flags, auth } = props.backgroundData;
  if (doNotMarkMessagesAsRead) {
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

const handleImage = (props: Props, src: string, messageId: number) => {
  const message = props.messages.find(x => x.id === messageId);
  if (message && !message.isOutbox) {
    NavigationService.dispatch(navigateToLightbox(src, message));
  }
};

const handleLongPress = (
  props: Props,
  _: GetText,
  target: 'message' | 'header' | 'link',
  messageId: number,
  href: string | null,
) => {
  if (href !== null) {
    const url = new URL(href, props.backgroundData.auth.realm).toString();
    Clipboard.setString(url);
    showToast(_('Link copied to clipboard'));
    return;
  }

  const message = props.messages.find(x => x.id === messageId);
  if (!message) {
    return;
  }
  const { dispatch, showActionSheetWithOptions, backgroundData, narrow, startEditMessage } = props;
  if (target === 'header') {
    if (message.type === 'stream') {
      showTopicActionSheet({
        showActionSheetWithOptions,
        callbacks: { dispatch, _ },
        backgroundData,
        streamId: message.stream_id,
        topic: message.subject,
      });
    } else if (message.type === 'private') {
      const label = pmUiRecipientsFromMessage(message, backgroundData.ownUser.user_id)
        .map(r => r.full_name)
        .sort()
        .join(', ');
      showToast(label);
    }
  } else if (target === 'message') {
    showMessageActionSheet({
      showActionSheetWithOptions,
      callbacks: { dispatch, startEditMessage, _ },
      backgroundData,
      message,
      narrow,
    });
  }
};

export const handleWebViewOutboundEvent = (
  props: Props,
  _: GetText,
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
      NavigationService.dispatch(navigateToAccountDetails(event.fromUserId));
      break;
    }

    case 'narrow':
      props.dispatch(doNarrow(parseNarrow(base64Utf8Decode(event.narrow))));
      break;

    case 'image':
      handleImage(props, event.src, event.messageId);
      break;

    case 'longPress':
      handleLongPress(props, _, event.target, event.messageId, event.href);
      break;

    case 'url':
      if (isUrlAnImage(event.href)) {
        handleImage(props, event.href, event.messageId);
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
        NavigationService.dispatch(navigateToMessageReactionScreen(messageId, reactionName));
      }
      break;

    case 'mention': {
      NavigationService.dispatch(navigateToAccountDetails(event.userId));
      break;
    }

    case 'time': {
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

    case 'error':
      logging.error('WebView error', event.details);
      break;

    default:
      ensureUnreachable(event);
      logging.error(`WebView event of unknown type: ${event.type}`);
      break;
  }
};
