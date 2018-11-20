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

const handleScroll = (props: Props, event: MessageListEventScroll) => {
  const { innerHeight, offsetHeight, scrollY, startMessageId, endMessageId } = event;
  const { dispatch, narrow } = props;

  if (scrollY < config.messageListThreshold) {
    dispatch(fetchOlder(narrow));
  }

  if (innerHeight + scrollY >= offsetHeight - config.messageListThreshold) {
    dispatch(fetchNewer(narrow));
  }

  const unreadMessageIds = filterUnreadMessagesInRange(
    props.messages,
    props.flags,
    startMessageId,
    endMessageId,
  );

  if (unreadMessageIds.length > 0 && !props.debug.doNotMarkMessagesAsRead) {
    queueMarkAsRead(props.auth, unreadMessageIds);
  }
};

const handleImage = (props: Props, event: MessageListEventImage) => {
  const { src, messageId } = event;
  const message = props.messages.find(x => x.id === messageId);
  if (message) {
    props.dispatch(navigateToLightbox(src, message));
  }
};

const handleUrl = (props: Props, event: MessageListEventUrl) => {
  const { dispatch } = props;

  if (isUrlAnImage(event.href)) {
    const imageEvent = { type: 'image', src: event.href, messageId: event.messageId };
    handleImage(props, imageEvent);
    return;
  }

  dispatch(messageLinkPress(event.href));
};

export const handleMessageListEvent = (props: Props, event: MessageListEvent) => {
  switch (event.type) {
    case 'ready':
      // handled by caller
      break;

    case 'scroll':
      handleScroll(props, event);
      break;

    case 'avatar':
      props.dispatch(navigateToAccountDetails(event.fromEmail));
      break;

    case 'narrow':
      props.dispatch(doNarrow(parseNarrowString(event.narrow)));
      break;

    case 'image':
      handleImage(props, event);
      break;

    case 'longPress':
      props.onLongPress(event.messageId, event.target);
      break;

    case 'url':
      handleUrl(props, event);
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
