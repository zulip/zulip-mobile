/* @flow strict-local */
import { Clipboard, Share } from 'react-native';
import type { Auth, Dispatch, GetText, Message, Narrow, Subscription } from '../types';
import type { BackgroundData } from '../webview/MessageList';
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
import { doNarrow, startEditMessage, deleteOutboxMessage, navigateToEmojiPicker } from '../actions';

type ActionParams = {
  auth: Auth,
  message: Message,
  subscriptions: Subscription[],
  dispatch: Dispatch,
  getString: (value: string) => string,
};

const isAnOutboxMessage = (message: Message): boolean => message.isOutbox;

const reply = ({ message, dispatch, auth }: ActionParams) => {
  dispatch(doNarrow(getNarrowFromMessage(message, auth.email), message.id));
};

const copyToClipboard = async ({ getString, auth, message }: ActionParams) => {
  const rawMessage = isAnOutboxMessage(message) /* $FlowFixMe: then really type Outbox */
    ? message.markdownContent
    : await getMessageContentById(auth, message.id);
  Clipboard.setString(rawMessage);
  showToast(getString('Message copied'));
};

const editMessage = async ({ message, dispatch }: ActionParams) => {
  dispatch(startEditMessage(message.id, message.subject));
};

const doDeleteMessage = async ({ auth, message, dispatch }: ActionParams) => {
  if (isAnOutboxMessage(message)) {
    dispatch(deleteOutboxMessage(message.timestamp));
  } else {
    deleteMessage(auth, message.id);
  }
};

const doUnmuteTopic = ({ auth, message }: ActionParams) => {
  unmuteTopic(auth, message.display_recipient, message.subject);
};

const doMuteTopic = ({ auth, message }: ActionParams) => {
  muteTopic(auth, message.display_recipient, message.subject);
};

const doUnmuteStream = ({ auth, message, subscriptions }: ActionParams) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    toggleMuteStream(auth, sub.stream_id, false);
  }
};

const doMuteStream = ({ auth, message, subscriptions }: ActionParams) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    toggleMuteStream(auth, sub.stream_id, true);
  }
};

const starMessage = ({ auth, message }: ActionParams) => {
  toggleMessageStarred(auth, [message.id], true);
};

const unstarMessage = ({ auth, message }: ActionParams) => {
  toggleMessageStarred(auth, [message.id], false);
};

const shareMessage = ({ message }: ActionParams) => {
  Share.share({
    message: message.content.replace(/<(?:.|\n)*?>/gm, ''),
  });
};

const addReaction = ({ message, dispatch }: ActionParams) => {
  dispatch(navigateToEmojiPicker(message.id));
};

type FilterParams = {
  message: Message,
  auth: Auth,
  narrow: Narrow,
};

const isSentMessage = ({ message }: FilterParams): boolean => !isAnOutboxMessage(message);

const isSentBySelfAndNarrowed = ({ message, auth, narrow }: FilterParams): boolean =>
  auth.email === message.sender_email && !isHomeNarrow(narrow) && !isSpecialNarrow(narrow);

const isSentBySelf = ({ message, auth }: FilterParams): boolean =>
  auth.email === message.sender_email;

const isNotDeleted = ({ message }: FilterParams): boolean => message.content !== '<p>(deleted)</p>';

const skip = () => false;

function allOf<T>(predicates: ((T) => boolean)[]): T => boolean {
  return x => predicates.every(p => p(x));
}

type ButtonDescription = {
  title: string,
  onPress: ActionParams => void | Promise<void>,
  onlyIf?: FilterParams => boolean,
};

const allButtonsRaw = {
  addReaction: {
    title: 'Add a reaction',
    onPress: addReaction,
    onlyIf: allOf([isSentMessage, isNotDeleted]),
  },
  reply: { title: 'Reply', onPress: reply, onlyIf: isSentMessage },
  copyToClipboard: { title: 'Copy to clipboard', onPress: copyToClipboard, onlyIf: isNotDeleted },
  shareMessage: { title: 'Share', onPress: shareMessage, onlyIf: isNotDeleted },
  editMessage: {
    title: 'Edit message',
    onPress: editMessage,
    onlyIf: allOf([isSentMessage, isSentBySelfAndNarrowed]),
  },
  deleteMessage: {
    title: 'Delete message',
    onPress: doDeleteMessage,
    onlyIf: allOf([isSentBySelf, isNotDeleted]),
  },

  // If skip then covered in constructMessageActionButtons
  starMessage: { title: 'Star message', onPress: starMessage, onlyIf: skip },
  unstarMessage: { title: 'Unstar message', onPress: unstarMessage, onlyIf: skip },
  cancel: { title: 'Cancel', onPress: () => {}, onlyIf: skip },

  // Header
  unmuteTopic: { title: 'Unmute topic', onPress: doUnmuteTopic },
  muteTopic: { title: 'Mute topic', onPress: doMuteTopic },
  muteStream: { title: 'Mute stream', onPress: doMuteStream },
  unmuteStream: { title: 'Unmute stream', onPress: doUnmuteStream },
};

type ButtonCode = $Keys<typeof allButtonsRaw>;

const allButtons: { [ButtonCode]: ButtonDescription } = allButtonsRaw;

type ConstructSheetParams = {
  backgroundData: BackgroundData,
  message: Message,
  narrow: Narrow,
};

export const constructHeaderActionButtons = ({
  backgroundData: { mute, subscriptions },
  message,
}: ConstructSheetParams) => {
  const buttons = [];
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

export const constructMessageActionButtons = ({
  backgroundData: { auth, flags },
  message,
  narrow,
}: ConstructSheetParams) => {
  const buttons = [];
  [
    'addReaction',
    'reply',
    'copyToClipboard',
    'shareMessage',
    'editMessage',
    'deleteMessage',
  ].forEach((code: ButtonCode) => {
    const button = allButtons[code];
    if (button.onlyIf && button.onlyIf({ message, auth, narrow })) {
      buttons.push(button.title);
    }
  });
  if (!isAnOutboxMessage(message)) {
    if (message.id in flags.starred) {
      buttons.push('Unstar message');
    } else {
      buttons.push('Star message');
    }
  }
  buttons.push('Cancel');
  return buttons;
};

export const constructActionButtons = (target: string) =>
  target === 'header' ? constructHeaderActionButtons : constructMessageActionButtons;

const executeActionSheetAction = (isHeader: boolean, title: string, props: ActionParams) => {
  const code: ?ButtonCode = Object.keys(allButtons).find(c => allButtons[c].title === title);
  if (!code) {
    throw new Error(`bad action-sheet title: ${title}`);
  }
  allButtons[code].onPress(props);
};

/** Invoke the given callback to show an appropriate action sheet. */
export const showActionSheet = (
  isHeader: boolean,
  dispatch: Dispatch,
  showActionSheetWithOptions: (
    { options: string[], cancelButtonIndex: number },
    (number) => void,
  ) => void,
  _: GetText,
  params: ConstructSheetParams,
): void => {
  const optionCodes = constructActionButtons(isHeader ? 'header' : 'message')(params);
  const callback = buttonIndex => {
    executeActionSheetAction(isHeader, optionCodes[buttonIndex], {
      dispatch,
      subscriptions: params.backgroundData.subscriptions,
      auth: params.backgroundData.auth,
      getString: _,
      ...params,
    });
  };
  showActionSheetWithOptions(
    {
      options: optionCodes.map(code => _(code)),
      cancelButtonIndex: optionCodes.length - 1,
    },
    callback,
  );
};
