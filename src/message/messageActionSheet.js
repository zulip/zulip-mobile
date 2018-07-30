/* @flow */
import { Clipboard, Share } from 'react-native';
import type {
  Auth,
  Dispatch,
  Message,
  MuteTuple,
  Narrow,
  Subscription,
  AuthGetStringAndMessageType,
} from '../types';
import { getNarrowFromMessage, isHomeNarrow, isSpecialNarrow } from '../utils/narrow';
import { isTopicMuted } from '../utils/message';
import {
  getMessageContentById,
  muteTopic,
  unmuteTopic,
  toggleMuteStream,
  deleteMessage,
  toggleMessageStarred,
} from '../api';
import { showToast } from '../utils/info';
import {
  doNarrow,
  navigateBack,
  startEditMessage,
  deleteOutboxMessage,
  navigateToEmojiPicker,
} from '../actions';

type ReplyOptionType = {
  message: Message,
  dispatch: Dispatch,
  auth: Auth,
  currentRoute?: string,
  onReplySelect?: () => void,
};

type AuthAndMessageType = {
  auth: Auth,
  message: Message,
};

type AuthMessageAndSubscriptionsType = {
  auth: Auth,
  message: Message,
  subscriptions: Subscription[],
};

type ButtonProps = {
  auth: Auth,
  message: Message,
  subscriptions: Subscription[],
  dispatch: Dispatch,
  currentRoute?: string,
  onReplySelect?: () => void,
  getString: (value: string) => string,
};

type ExecuteActionSheetParams = {
  title: string,
  auth: Auth,
  message: Message,
  subscriptions: Subscription[],
  dispatch: Dispatch,
  header?: boolean,
  currentRoute?: string,
  onReplySelect?: () => void,
  getString: (value: string) => string,
};

type ConstructActionButtonsType = {
  message: Message,
  auth: Auth,
  narrow: Narrow,
  flags: Object,
  currentRoute?: string,
  getString: (value: string) => string,
};

type ConstructHeaderActionButtonsType = {
  message: Message,
  subscriptions: Subscription[],
  mute: MuteTuple[],
  getString: (value: string) => string,
};

type MessageAuthAndDispatch = {
  message: Message,
  auth: Auth,
  dispatch: Dispatch,
};

type AuthMessageAndNarrow = {
  message: Message,
  auth: Auth,
  narrow: Narrow,
};

const isAnOutboxMessage = (message: Message): boolean => message.isOutbox;

const reply = ({ message, dispatch, auth, currentRoute, onReplySelect }: ReplyOptionType) => {
  if (currentRoute === 'search') {
    dispatch(navigateBack());
  }
  dispatch(doNarrow(getNarrowFromMessage(message, auth.email), message.id));
  if (onReplySelect) {
    onReplySelect();
  } // focus message input
};

const copyToClipboard = async ({ getString, auth, message }: AuthGetStringAndMessageType) => {
  const rawMessage = isAnOutboxMessage(message)
    ? message.markdownContent
    : await getMessageContentById(auth, message.id);
  Clipboard.setString(rawMessage);
  showToast(getString('Message copied'));
};

const editMessage = async ({ message, dispatch }: MessageAuthAndDispatch) => {
  dispatch(startEditMessage(message.id, message.subject));
};

const doDeleteMessage = async ({ auth, message, dispatch }: MessageAuthAndDispatch) => {
  if (isAnOutboxMessage(message)) {
    dispatch(deleteOutboxMessage(message.timestamp));
  } else {
    deleteMessage(auth, message.id);
  }
};

const doUnmuteTopic = ({ auth, message }: AuthAndMessageType) => {
  unmuteTopic(auth, message.display_recipient, message.subject);
};

const doMuteTopic = ({ auth, message }: AuthAndMessageType) => {
  muteTopic(auth, message.display_recipient, message.subject);
};

const doUnmuteStream = ({ auth, message, subscriptions }: AuthMessageAndSubscriptionsType) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    toggleMuteStream(auth, sub.stream_id, false);
  }
};

const doMuteStream = ({ auth, message, subscriptions }: AuthMessageAndSubscriptionsType) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    toggleMuteStream(auth, sub.stream_id, true);
  }
};

const starMessage = ({ auth, message }: AuthAndMessageType) => {
  toggleMessageStarred(auth, [message.id], true);
};

const unstarMessage = ({ auth, message }: AuthGetStringAndMessageType) => {
  toggleMessageStarred(auth, [message.id], false);
};

const shareMessage = ({ message }) => {
  Share.share({
    message: message.content.replace(/<(?:.|\n)*?>/gm, ''),
  });
};

const addReaction = ({ message, dispatch }) => {
  dispatch(navigateToEmojiPicker(message.id));
};

const isSentMessage = ({ message }: { message: Message }): boolean => !isAnOutboxMessage(message);

const isSentBySelfAndNarrowed = ({ message, auth, narrow }: AuthMessageAndNarrow): boolean =>
  auth.email === message.sender_email && !isHomeNarrow(narrow) && !isSpecialNarrow(narrow);

const isSentBySelf = ({ message, auth }: AuthAndMessageType): boolean =>
  auth.email === message.sender_email;

const isNotDeleted = ({ message }): boolean => message.content !== '<p>(deleted)</p>';

const skip = (...args) => false;

function allOf<T>(predicates: ((T) => boolean)[]): T => boolean {
  return x => predicates.every(p => p(x));
}

const actionSheetButtons /* ActionSheetButtonType[] */ = [
  {
    title: 'Add a reaction',
    onPress: addReaction,
    onlyIf: allOf([isSentMessage, isNotDeleted]),
  },
  { title: 'Reply', onPress: reply, onlyIf: isSentMessage },
  { title: 'Copy to clipboard', onPress: copyToClipboard, onlyIf: isNotDeleted },
  { title: 'Share', onPress: shareMessage, onlyIf: isNotDeleted },
  {
    title: 'Edit message',
    onPress: editMessage,
    onlyIf: allOf([isSentMessage, isSentBySelfAndNarrowed]),
  },
  {
    title: 'Delete message',
    onPress: doDeleteMessage,
    onlyIf: allOf([isSentMessage, isSentBySelf, isNotDeleted]),
  },
  // If skip then covered in constructMessageActionButtons
  { title: 'Star message', onPress: starMessage, onlyIf: skip },
  { title: 'Unstar message', onPress: unstarMessage, onlyIf: skip },
  { title: 'Cancel', onPress: skip, onlyIf: skip },
];

type HeaderButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void,
};

const actionHeaderSheetButtons: HeaderButtonType[] = [
  { title: 'Unmute topic', onPress: doUnmuteTopic },
  { title: 'Mute topic', onPress: doMuteTopic },
  { title: 'Mute stream', onPress: doMuteStream },
  { title: 'Unmute stream', onPress: doUnmuteStream },
  { title: 'Cancel', onPress: () => {} },
];

export const constructHeaderActionButtons = ({
  message,
  subscriptions,
  mute,
  getString,
}: ConstructHeaderActionButtonsType) => {
  const buttons = [];
  if (message.type === 'stream') {
    if (isTopicMuted(message.display_recipient, message.subject, mute)) {
      buttons.push(getString('Unmute topic'));
    } else {
      buttons.push(getString('Mute topic'));
    }
    const sub = subscriptions.find(x => x.name === message.display_recipient);
    if (sub && !sub.in_home_view) {
      buttons.push(getString('Unmute stream'));
    } else {
      buttons.push(getString('Mute stream'));
    }
  }
  buttons.push(getString('Cancel'));
  return buttons;
};

export const constructMessageActionButtons = ({
  message,
  auth,
  narrow,
  flags,
  onReplySelect,
  currentRoute,
  getString,
}: ConstructActionButtonsType) => {
  const buttons = actionSheetButtons
    .filter(x => !x.onlyIf || x.onlyIf({ message, auth, narrow }))
    .map(x => getString(x.title));
  if (isSentMessage({ message })) {
    if (message.id in flags.starred) {
      buttons.push(getString('Unstar message'));
    } else {
      buttons.push(getString('Star message'));
    }
  }
  buttons.push(getString('Cancel'));
  return buttons;
};

export const executeActionSheetAction = ({
  title,
  header,
  getString,
  ...props
}: ExecuteActionSheetParams) => {
  if (header) {
    const headerButton = actionHeaderSheetButtons.find(x => getString(x.title) === title);
    if (headerButton) {
      headerButton.onPress({ ...props, getString });
    }
  } else {
    const button = actionSheetButtons.find(x => getString(x.title) === title);
    if (button) {
      button.onPress({ ...props, getString });
    }
  }
};

export const constructActionButtons = (target: string) =>
  target === 'header' ? constructHeaderActionButtons : constructMessageActionButtons;

export type ShowActionSheetTypes = {
  options: Array<any>,
  cancelButtonIndex: number,
  callback: number => void,
};
