/* @flow */
import { Clipboard, Share } from 'react-native';
import type {
  Actions,
  Auth,
  Message,
  ActionSheetButtonType,
  AuthGetStringAndMessageType,
} from '../types';
import { getNarrowFromMessage, isHomeNarrow, isSpecialNarrow } from '../utils/narrow';
import { isTopicMuted } from '../utils/message';
import {
  getMessageById,
  muteTopic,
  unmuteTopic,
  toggleMuteStream,
  deleteMessage,
  toggleMessageStarred,
} from '../api';
import { showToast } from '../utils/info';

type ReplyOptionType = {
  message: Object,
  actions: Actions,
  auth: Auth,
  currentRoute?: string,
  onReplySelect?: () => void,
};

type AuthAndMessageType = {
  auth: Auth,
  message: Object,
};

type AuthMessageAndSubscriptionsType = {
  auth: Auth,
  message: Object,
  subscriptions: any[],
};

type ButtonProps = {
  auth?: Auth,
  message: Object,
  subscriptions: any[],
  actions: Actions,
  currentRoute?: string,
  onReplySelect?: () => void,
  getString: (value: string) => string,
};

type ExecuteActionSheetParams = {
  title: string,
  auth?: Auth,
  message: Object,
  subscriptions: any[],
  actions: Actions,
  header?: boolean,
  currentRoute?: string,
  onReplySelect?: () => void,
  getString: (value: string) => string,
};

type ConstructActionButtonsType = {
  message: Object,
  auth: Auth,
  narrow: [],
  flags: Object,
  currentRoute?: string,
  getString: (value: string) => string,
};

type ConstructHeaderActionButtonsType = {
  message: Message,
  subscriptions: any[],
  mute: any[],
  getString: (value: string) => string,
};

type MessageAuthAndActions = {
  message: Message,
  auth: Auth,
  actions: Actions,
};

type AuthMessageAndNarrow = {
  message: Message,
  auth: Auth,
  narrow: [],
};

const isAnOutboxMessage = ({ message }: Message): boolean => message.isOutbox;

const reply = ({ message, actions, auth, currentRoute, onReplySelect }: ReplyOptionType) => {
  if (currentRoute === 'search') {
    actions.navigateBack();
  }
  actions.doNarrow(getNarrowFromMessage(message, auth.email), message.id);
  if (onReplySelect) onReplySelect(); // focus message input
};

const copyToClipboard = async ({ getString, auth, message }: AuthGetStringAndMessageType) => {
  const rawMessage = isAnOutboxMessage({ message })
    ? message.markdownContent
    : await getMessageById(auth, message.id);
  Clipboard.setString(rawMessage);
  showToast(getString('Message copied'));
};

const isSentMessage = ({ message }: Message): boolean => !isAnOutboxMessage({ message });

const editMessage = async ({ message, actions }: MessageAuthAndActions) => {
  actions.startEditMessage(message.id, message.subject);
};

const doDeleteMessage = async ({ auth, message, actions }: MessageAuthAndActions) => {
  if (isAnOutboxMessage({ message })) {
    actions.deleteOutboxMessage(message.timestamp);
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

const isSentBySelfAndNarrowed = ({ message, auth, narrow }: AuthMessageAndNarrow): boolean =>
  auth.email === message.sender_email && !isHomeNarrow(narrow) && !isSpecialNarrow(narrow);

const isSentBySelf = ({ message, auth }: AuthAndMessageType): boolean =>
  auth.email === message.sender_email;

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

const skip = () => false;

type HeaderButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
  onlyIf?: (props: Message) => boolean,
};

const resolveMultiple = (message, auth, narrow, functions) =>
  functions.every(f => {
    if (!f({ message, auth, narrow })) return false;
    return true;
  });

const actionSheetButtons: ActionSheetButtonType[] = [
  { title: 'Reply', onPress: reply, onlyIf: isSentMessage },
  { title: 'Copy to clipboard', onPress: copyToClipboard },
  { title: 'Share', onPress: shareMessage },
  {
    title: 'Edit message',
    onPress: editMessage,
    onlyIf: ({ message, auth, narrow }) =>
      resolveMultiple(message, auth, narrow, [isSentMessage, isSentBySelfAndNarrowed]),
  },
  {
    title: 'Delete message',
    onPress: doDeleteMessage,
    onlyIf: ({ message, auth, narrow }) =>
      resolveMultiple(message, auth, narrow, [isSentMessage, isSentBySelf]),
  },
  // If skip then covered in constructActionButtons
  { title: 'Star message', onPress: starMessage, onlyIf: skip },
  { title: 'Unstar message', onPress: unstarMessage, onlyIf: skip },
  { title: 'Cancel', onPress: skip, onlyIf: skip },
];

const actionHeaderSheetButtons: HeaderButtonType[] = [
  { title: 'Unmute topic', onPress: doUnmuteTopic, onlyIf: skip },
  { title: 'Mute topic', onPress: doMuteTopic, onlyIf: skip },
  { title: 'Mute stream', onPress: doMuteStream, onlyIf: skip },
  { title: 'Unmute stream', onPress: doUnmuteStream, onlyIf: skip },
  { title: 'Cancel', onPress: skip, onlyIf: skip },
];

export const constructHeaderActionButtons = ({
  message,
  subscriptions,
  mute,
  getString,
}: ConstructHeaderActionButtonsType) => {
  const buttons = actionHeaderSheetButtons
    .filter(x => !x.onlyIf || x.onlyIf({ message }))
    .map(x => getString(x.title));
  // These are dependent conditions, hence better if we manage here rather than using onlyIf
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

export const constructActionButtons = ({
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

export type ShowActionSheetTypes = {
  options: Array<any>,
  cancelButtonIndex: number,
  callback: number => void,
};
