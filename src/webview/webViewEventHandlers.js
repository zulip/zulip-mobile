/* @flow */
import { emojiReactionAdd, emojiReactionRemove, queueMarkAsRead } from '../api';
import config from '../config';
import type { Actions, Auth, FlagsState, Message, Narrow } from '../types';
import { isUrlAnImage } from '../utils/url';
import { filterUnreadMessagesInRange } from '../utils/unread';
import { parseNarrowString } from '../utils/narrow';

type MessageListEventScroll = {
  innerHeight: number,
  offsetHeight: number,
  scrollY: number,
  startMessageId: number,
  endMessageId: number,
};

type MessageListEventAvatar = {
  fromEmail: string,
};

type MessageListEventNarrow = {
  narrow: string,
  fromEmail: string,
};

type MessageListEventImage = {
  src: string,
  messageId: number,
};

type MessageListEventReaction = {
  messageId: number,
  name: string,
  code: string,
  reactionType: string,
  voted: boolean,
};

type MessageListEventUrl = {
  href: string,
  messageId: number,
};

type MessageListEventLongPress = {
  target: string,
  messageId: number,
};

type MessageListEventDebug = Object;

type Props = {
  actions: Actions,
  auth: Auth,
  debug: Object,
  flags: FlagsState,
  messages: Message[],
  narrow: Narrow,
  onLongPress: (messageId: number, target: string) => void,
};

export const handleScroll = (props: Props, event: MessageListEventScroll) => {
  const { innerHeight, offsetHeight, scrollY, startMessageId, endMessageId } = event;
  const { actions, narrow } = props;

  if (scrollY < config.messageListThreshold) {
    actions.fetchOlder(narrow);
  }

  if (innerHeight + scrollY >= offsetHeight - config.messageListThreshold) {
    actions.fetchNewer(narrow);
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

export const handleAvatar = (props: Props, event: MessageListEventAvatar) => {
  props.actions.navigateToAccountDetails(event.fromEmail);
};

export const handleNarrow = ({ actions }: Props, event: MessageListEventNarrow) => {
  actions.doNarrow(parseNarrowString(event.narrow));
};

export const handleImage = (props: Props, event: MessageListEventImage) => {
  const { src, messageId } = event;

  const message = props.messages.find(x => x.id === messageId);

  if (message) {
    props.actions.navigateToLightbox(src, message);
  }
};

export const handleLongPress = (props: Props, event: MessageListEventLongPress) => {
  const { messageId, target } = event;
  props.onLongPress(messageId, target);
};

export const handleUrl = (props: Props, event: MessageListEventUrl) => {
  const { actions } = props;

  if (isUrlAnImage(event.href)) {
    const imageEvent = { src: event.href, messageId: event.messageId };
    handleImage(props, imageEvent);
    return;
  }

  actions.messageLinkPress(event.href);
};

export const handleReaction = (props: Props, event: MessageListEventReaction) => {
  const { code, messageId, name, reactionType, voted } = event;

  if (voted) {
    emojiReactionRemove(props.auth, messageId, reactionType, code, name);
  } else {
    emojiReactionAdd(props.auth, messageId, reactionType, code, name);
  }
};

export const handleDebug = (props: Props, event: MessageListEventDebug) => {
  console.debug(props, event); // eslint-disable-line
};
