/* @flow */
import type { Actions, Auth, Message } from '../types';
import config from '../config';
import { isUrlAnImage } from '../utils/url';
import { emojiReactionAdd, emojiReactionRemove } from '../api';

type MessageListEventScroll = {
  innerHeight: number,
  offsetHeight: number,
  scrollY: number,
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
  voted: boolean,
};

type MessageListEventUrl = {
  href: string,
  messageId: number,
};

type MessageListEventDebug = Object;

type Props = {
  actions: Actions,
  auth: Auth,
  messages: Message[],
};

export const handleScroll = (props: Props, event: MessageListEventScroll) => {
  const { innerHeight, offsetHeight, scrollY } = event;
  const { actions } = props;

  if (scrollY < config.messageListThreshold) {
    actions.fetchOlder();
  } else if (innerHeight + scrollY >= offsetHeight - config.messageListThreshold) {
    actions.fetchNewer();
  }
};

export const handleAvatar = (props: Props, event: MessageListEventAvatar) => {
  props.actions.navigateToAccountDetails(event.fromEmail);
};

export const handleNarrow = ({ actions }: Props, event: MessageListEventNarrow) => {
  actions.doNarrow(JSON.parse(event.narrow.replace(/'/g, '"')));
};

export const handleImage = (props: Props, event: MessageListEventImage) => {
  const { src, messageId } = event;

  const message = props.messages.find(x => x.id === messageId);

  if (message) {
    props.actions.navigateToLightbox(src, message);
  }
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
  const { messageId, name, voted } = event;

  if (voted) {
    emojiReactionRemove(props.auth, messageId, name);
  } else {
    emojiReactionAdd(props.auth, messageId, name);
  }
};

export const handleDebug = (props: Props, event: MessageListEventDebug) => {
  console.debug(props, event); // eslint-disable-line
};
