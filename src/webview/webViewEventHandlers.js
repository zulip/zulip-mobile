/* @flow */
import { emojiReactionAdd, emojiReactionRemove, queueMarkAsRead } from '../api';
import config from '../config';
import type { Dispatch, GetText, Message, Narrow } from '../types';
import type { BackgroundData } from './MessageList';
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
import { showActionSheet } from '../message/messageActionSheet';

type MessageListEventReady = {|
  type: 'ready',
|};

// The user scrolled in the message list, or we pretended they did.  We may
// need to fetch more messages, or mark some messages as read.
type MessageListEventScroll = {|
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

type MessageListEventAvatar = {|
  type: 'avatar',
  fromEmail: string,
|};

type MessageListEventNarrow = {|
  type: 'narrow',
  narrow: string,
|};

type MessageListEventImage = {|
  type: 'image',
  src: string,
  messageId: number,
|};

type MessageListEventReaction = {|
  type: 'reaction',
  messageId: number,
  name: string,
  code: string,
  reactionType: string,
  voted: boolean,
|};

type MessageListEventUrl = {|
  type: 'url',
  href: string,
  messageId: number,
|};

type MessageListEventLongPress = {|
  type: 'longPress',
  target: 'message' | 'header',
  messageId: number,
|};

type MessageListEventDebug = {|
  type: 'debug',
|};

type MessageListEventError = {|
  type: 'error',
  details: {
    message: string,
    source: string,
    line: number,
    column: number,
    error: Object,
  },
|};

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

type Props = $ReadOnly<{
  backgroundData: BackgroundData,
  dispatch: Dispatch,
  messages: Message[],
  narrow: Narrow,
  onEditMessageSelect: (editMessage: Message) => Promise<void>,
  showActionSheetWithOptions: (Object, (number) => void) => void,
}>;

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
  const { debug, flags, auth } = props.backgroundData;
  if (debug.doNotMarkMessagesAsRead) {
    return;
  }
  const unreadMessageIds = filterUnreadMessagesInRange(
    props.messages,
    flags,
    event.startMessageId,
    event.endMessageId,
  );
  if (unreadMessageIds.length > 0) {
    queueMarkAsRead(auth, unreadMessageIds);
  }
};

const handleImage = (props: Props, src: string, messageId: number) => {
  const message = props.messages.find(x => x.id === messageId);
  if (message) {
    props.dispatch(navigateToLightbox(src, message));
  }
};

const handleLongPress = (props: Props, _: GetText, isHeader: boolean, messageId: number) => {
  const message = props.messages.find(x => x.id === messageId);
  if (!message) {
    return;
  }
  const {
    dispatch,
    showActionSheetWithOptions,
    backgroundData,
    narrow,
    onEditMessageSelect,
  } = props;
  showActionSheet(isHeader, dispatch, showActionSheetWithOptions, _, {
    backgroundData,
    message,
    narrow,
    onEditMessageSelect,
  });
};

export const handleMessageListEvent = (props: Props, _: GetText, event: MessageListEvent) => {
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
      handleLongPress(props, _, event.target === 'header', event.messageId);
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
          emojiReactionRemove(auth, messageId, reactionType, code, name);
        } else {
          emojiReactionAdd(auth, messageId, reactionType, code, name);
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
