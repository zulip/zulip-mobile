/* @flow */
import { Clipboard, Share } from 'react-native';
import type { Actions, Auth, Message } from '../types';
import { narrowFromMessage, isHomeNarrow, isStreamNarrow, isSpecialNarrow } from '../utils/narrow';
import { getSingleMessage } from '../api';
import { isTopicMuted } from '../utils/message';
import muteTopicApi from '../api/muteTopic';
import unmuteTopicApi from '../api/unmuteTopic';
import unmuteStreamApi from '../api/unmuteStream';
import muteStreamApi from '../api/muteStream';
import deleteMessageApi from '../api/deleteMessage';
import toggleMessageStarredApi from '../api/toggleMessageStarred';
import showToast from '../utils/showToast';

type MessageAndDoNarrowType = {
  message: Object,
  actions: Actions,
  auth: Auth,
  currentRoute?: string,
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
};

type ExecuteActionSheetParams = {
  title: string,
  auth?: Auth,
  message: Object,
  subscriptions: any[],
  actions: Actions,
  header?: boolean,
  currentRoute?: string,
};

type ConstructActionButtonsType = {
  message: Object,
  auth: Auth,
  narrow: [],
  flags: Object,
};

type ConstructHeaderActionButtonsType = {
  message: Message,
  subscriptions: any[],
  mute: any[],
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

const isAnOutboxMessage = ({ message }: Message): boolean =>
  message.isOutbox && message.isOutbox === true;

const narrowToConversation = ({ message, actions, auth, currentRoute }: MessageAndDoNarrowType) => {
  actions.doNarrow(narrowFromMessage(message, auth.email), message.id);
  if (currentRoute === 'search') {
    actions.navigateBack();
  }
};

const reply = ({ message, actions, auth, currentRoute }: MessageAndDoNarrowType) => {
  actions.doNarrow(narrowFromMessage(message, auth.email), message.id);
  if (currentRoute === 'search') {
    actions.navigateBack();
  }
};

const copyToClipboard = async ({ auth, message }: AuthAndMessageType) => {
  const rawMessage = isAnOutboxMessage({ message })
    ? message.content
    : await getSingleMessage(auth, message.id);
  Clipboard.setString(rawMessage);
  showToast('Message copied!');
};

const isSentMessage = ({ message }: Message): boolean => !isAnOutboxMessage({ message });

const editMessage = async ({ message, actions }: MessageAuthAndActions) => {
  actions.startEditMessage(message.id);
};

const deleteMessage = async ({ auth, message, actions }: MessageAuthAndActions) => {
  if (isAnOutboxMessage({ message })) actions.deleteOutboxMessage(message.timestamp);
  else deleteMessageApi(auth, message.id);
};

const unmuteTopic = ({ auth, message }: AuthAndMessageType) => {
  unmuteTopicApi(auth, message.display_recipient, message.subject);
};

const muteTopic = ({ auth, message }: AuthAndMessageType) => {
  muteTopicApi(auth, message.display_recipient, message.subject);
};

const unmuteStream = ({ auth, message, subscriptions }: AuthMessageAndSubscriptionsType) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    unmuteStreamApi(auth, sub.stream_id);
  }
};

const muteStream = ({ auth, message, subscriptions }: AuthMessageAndSubscriptionsType) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    muteStreamApi(auth, sub.stream_id);
  }
};

const isSentBySelfAndNarrowed = ({ message, auth, narrow }: AuthMessageAndNarrow): boolean =>
  auth.email === message.sender_email && !isHomeNarrow(narrow) && !isSpecialNarrow(narrow);

const starMessage = ({ auth, message }: AuthAndMessageType) => {
  toggleMessageStarredApi(auth, [message.id], true);
};

const unstarMessage = ({ auth, message }: AuthAndMessageType) => {
  toggleMessageStarredApi(auth, [message.id], false);
};

const shareMessage = ({ message }) => {
  Share.share({
    message: message.content.replace(/<(?:.|\n)*?>/gm, ''),
  });
};

const skip = () => false;

type ButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
  onlyIf?: (props: AuthMessageAndNarrow) => boolean,
};

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

const actionSheetButtons: ButtonType[] = [
  { title: 'Reply', onPress: reply, onlyIf: isSentMessage },
  { title: 'Copy to clipboard', onPress: copyToClipboard },
  { title: 'Share', onPress: shareMessage },
  {
    title: 'Edit Message',
    onPress: editMessage,
    onlyIf: ({ message, auth, narrow }) =>
      resolveMultiple(message, auth, narrow, [isSentMessage, isSentBySelfAndNarrowed]),
  },
  { title: 'Delete message', onPress: deleteMessage },
  // If skip then covered in constructActionButtons
  { title: 'Narrow to conversation', onPress: narrowToConversation, onlyIf: skip },
  { title: 'Star Message', onPress: starMessage, onlyIf: skip },
  { title: 'Unstar Message', onPress: unstarMessage, onlyIf: skip },
  { title: 'Cancel', onPress: skip, onlyIf: skip },
];

const actionHeaderSheetButtons: HeaderButtonType[] = [
  { title: 'Unmute topic', onPress: unmuteTopic, onlyIf: skip },
  { title: 'Mute topic', onPress: muteTopic, onlyIf: skip },
  { title: 'Mute stream', onPress: muteStream, onlyIf: skip },
  { title: 'Unmute stream', onPress: unmuteStream, onlyIf: skip },
  { title: 'Cancel', onPress: skip, onlyIf: skip },
];

export const constructHeaderActionButtons = ({
  message,
  subscriptions,
  mute,
}: ConstructHeaderActionButtonsType) => {
  const buttons = actionHeaderSheetButtons
    .filter(x => !x.onlyIf || x.onlyIf({ message }))
    .map(x => x.title);
  // These are dependent conditions, hence better if we manage here rather than using onlyIf
  if (message.type === 'stream') {
    if (isTopicMuted(message.display_recipient, message.subject, mute)) {
      buttons.push('Unmute topic');
    } else {
      buttons.push('Mute topic');
    }
    const sub = subscriptions.find(x => x.name === message.display_recipient);
    if (sub && !sub.in_home_view) {
      buttons.push('Unmute stream');
    } else {
      buttons.push('Mute stream');
    }
  }
  buttons.push('Cancel');
  return buttons;
};

export const constructActionButtons = ({
  message,
  auth,
  narrow,
  flags,
}: ConstructActionButtonsType) => {
  const buttons = actionSheetButtons
    .filter(x => !x.onlyIf || x.onlyIf({ message, auth, narrow }))
    .map(x => x.title);

  // These are dependent conditions, hence better if we manage here rather than using onlyIf
  if (isHomeNarrow(narrow) || isStreamNarrow(narrow) || isSpecialNarrow(narrow)) {
    buttons.push('Narrow to conversation');
  }
  if (isSentMessage({ message })) {
    if (message.id in flags.starred) {
      buttons.push('Unstar Message');
    } else {
      buttons.push('Star Message');
    }
  }
  buttons.push('Cancel');
  return buttons;
};

export const executeActionSheetAction = ({ title, header, ...props }: ExecuteActionSheetParams) => {
  if (header) {
    const headerButton = actionHeaderSheetButtons.find(x => x.title === title);
    if (headerButton) {
      headerButton.onPress(props);
    }
  } else {
    const button = actionSheetButtons.find(x => x.title === title);
    if (button) {
      button.onPress(props);
    }
  }
};

export type ShowActionSheetTypes = {
  options: Array<any>,
  cancelButtonIndex: number,
  callback: number => void,
};
