/* @flow */
import type { Actions, Auth, Message } from '../types';

import { getResource } from '../utils/url';
import { emojiReactionAdd, emojiReactionRemove } from '../api';

type MessageListEventClick = {
  target: string,
  targetNodeName: string,
  targetClassName: string,
};

type MessageListEventScroll = {
  y: number,
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

type Props = {
  actions: Actions,
  auth: Auth,
  messages: Message[],
};

export const handleClick = (props: Props, event: MessageListEventClick) => {};

export const handleScroll = (props: Props, event: MessageListEventScroll) => {
  const { y, innerHeight, offsetHeight } = event;
  console.log(event);
  if (y === 0) {
    props.actions.fetchOlder();
  } else if (innerHeight + y >= offsetHeight) {
    props.actions.fetchNewer();
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
  const resource = getResource(src, props.auth);

  props.actions.navigateToLightbox(resource, message);
};

export const handleReaction = (props: Props, event: MessageListEventReaction) => {
  const { messageId, name, voted } = event;

  if (voted) {
    emojiReactionRemove(props.auth, messageId, name);
  } else {
    emojiReactionAdd(props.auth, messageId, name);
  }
};
