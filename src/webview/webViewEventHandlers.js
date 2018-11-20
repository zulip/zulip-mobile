/* @flow */
import { emojiReactionAdd, emojiReactionRemove, queueMarkAsRead } from '../api';
import config from '../config';
import type { Auth, Debug, Dispatch, FlagsState, Message, Narrow } from '../types';
import { isUrlAnImage } from '../utils/url';
import { logErrorRemotely } from '../utils/logging';
import { filterUnreadMessagesInRange } from '../utils/unread';
import { parseNarrowString } from '../utils/narrow';
import {
  fetchOlder,
  fetchNewer,
  navigateToAccountDetails,
  doNarrow,
  navigateToLightbox,
  messageLinkPress,
} from '../actions';

type MessageListEventReady = {
  type: 'ready',
};

// The user scrolled in the message list, or we pretended they did.  We may
// need to fetch more messages, or mark some messages as read.
type MessageListEventScroll = {
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
};

type MessageListEventAvatar = {
  type: 'avatar',
  fromEmail: string,
};

type MessageListEventNarrow = {
  type: 'narrow',
  narrow: string,
  fromEmail: string,
};

type MessageListEventImage = {
  type: 'image',
  src: string,
  messageId: number,
};

type MessageListEventReaction = {
  type: 'reaction',
  messageId: number,
  name: string,
  code: string,
  reactionType: string,
  voted: boolean,
};

type MessageListEventUrl = {
  type: 'url',
  href: string,
  messageId: number,
};

type MessageListEventLongPress = {
  type: 'longPress',
  target: 'message' | 'header',
  messageId: number,
};

type MessageListEventDebug = {
  type: 'debug',
};

type MessageListEventError = {
  type: 'error',
  details: {
    message: string,
    source: string,
    line: number,
    column: number,
    error: Object,
  },
};

export type MessageListEvent =
  | MessageListEventReady
  | MessageListEventScroll
  | MessageListEventAvatar
  | MessageListEventNarrow
  | MessageListEventImage
  | MessageListEventReaction
  | MessageListEventUrl
  | MessageListEventLongPress
  | MessageListEventDebug
  | MessageListEventError;

type Props = {
  dispatch: Dispatch,
  auth: Auth,
  debug: Debug,
  flags: FlagsState,
  messages: Message[],
  narrow: Narrow,
  onLongPress: (messageId: number, target: string) => void,
};

const fetchMore = (props: Props, event: MessageListEventScroll) => {
  const { innerHeight, offsetHeight, scrollY } = event;
  const { dispatch, narrow } = props;
  if (scrollY < config.messageListThreshold) {
    dispatch(fetchOlder(narrow));
  }
  if (innerHeight + scrollY >= offsetHeight - config.messageListThreshold) {
    dispatch(fetchNewer(narrow));
  }
};

const markRead = (props: Props, event: MessageListEventScroll) => {
  if (props.debug.doNotMarkMessagesAsRead) {
    return;
  }
  const unreadMessageIds = filterUnreadMessagesInRange(
    props.messages,
    props.flags,
    event.startMessageId,
    event.endMessageId,
  );
  if (unreadMessageIds.length > 0) {
    queueMarkAsRead(props.auth, unreadMessageIds);
  }
};

const handleImage = (props: Props, src: string, messageId: number) => {
  const message = props.messages.find(x => x.id === messageId);
  if (message) {
    props.dispatch(navigateToLightbox(src, message));
  }
};

export const handleMessageListEvent = (props: Props, event: MessageListEvent) => {
  switch (event.type) {
    case 'ready':
      // handled by caller
      break;

    case 'scroll':
      fetchMore(props, event);
      markRead(props, event);
      break;

    case 'avatar':
      props.dispatch(navigateToAccountDetails(event.fromEmail));
      break;

    case 'narrow':
      props.dispatch(doNarrow(parseNarrowString(event.narrow)));
      break;

    case 'image':
      handleImage(props, event.src, event.messageId);
      break;

    case 'longPress':
      props.onLongPress(event.messageId, event.target);
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
        if (voted) {
          emojiReactionRemove(props.auth, messageId, reactionType, code, name);
        } else {
          emojiReactionAdd(props.auth, messageId, reactionType, code, name);
        }
      }
      break;

    case 'debug':
      console.debug(props, event); // eslint-disable-line
      break;

    case 'error':
      logErrorRemotely(new Error(JSON.stringify(event.details)), 'WebView Exception');
      break;

    default:
      logErrorRemotely(new Error(event.type), 'WebView event of unknown type');
      break;
  }
};
