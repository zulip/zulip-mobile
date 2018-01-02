/* @flow */
import type { Actions, Auth, Message } from '../types';
import config from '../config';
import { isUrlAnImage } from '../utils/url';
import { emojiReactionAdd, emojiReactionRemove } from '../api';
import {
  constructActionButtons,
  executeActionSheetAction,
  constructHeaderActionButtons,
} from '../message/messageActionSheet';

type MessageListEventClick = {
  target: string,
  targetNodeName: string,
  targetClassName: string,
};

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

type MessageListLongPress = {
  messageId: number,
};

type Props = {
  actions: Actions,
  auth: Auth,
  messages: Message[],
};

export const handleClick = (props: Props, event: MessageListEventClick) => {};

export const handleLongPress = (props: Props, event: MessageListLongPress, context) => {
  const { messageId, target } = event;

  const {
    actions,
    messages,
    auth,
    narrow,
    mute,
    subscriptions,
    flags,
    currentRoute,
    onReplySelect,
  } = props;

  const message = messages.find(x => x.id === messageId);

  if (!message) {
    return;
  }
  const getString = value => context.intl.formatMessage({ id: value });
  let options;
  let callback;
  if (target === 'message') {
    options = constructActionButtons({
      message,
      auth,
      narrow,
      flags,
      currentRoute,
      getString,
    });
    callback = buttonIndex => {
      executeActionSheetAction({
        title: options[buttonIndex],
        message,
        actions,
        auth,
        subscriptions,
        currentRoute,
        onReplySelect,
        getString,
      });
    };
  } else {
    options = constructHeaderActionButtons({ message, subscriptions, mute, getString });
    callback = buttonIndex => {
      executeActionSheetAction({
        actions,
        title: options[buttonIndex],
        message,
        header: true,
        auth,
        subscriptions,
        getString,
      });
    };
  }

  props.showActionSheetWithOptions(
    {
      options,
      cancelButtonIndex: options.length - 1,
    },
    callback,
  );
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
