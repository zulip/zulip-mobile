/* @flow strict-local */
import { Clipboard, Share } from 'react-native';
import type { Auth, Dispatch, Message, Narrow, Subscription } from '../types';
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

type MessageButtonType = {
  title: string,
  onPress: ActionParams => void | Promise<void>,
  onlyIf: FilterParams => boolean,
};

const actionSheetButtons: MessageButtonType[] = [
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
    onlyIf: allOf([isSentBySelf, isNotDeleted]),
  },
  // If skip then covered in constructMessageActionButtons
  { title: 'Star message', onPress: starMessage, onlyIf: skip },
  { title: 'Unstar message', onPress: unstarMessage, onlyIf: skip },
  { title: 'Cancel', onPress: () => {}, onlyIf: skip },
];

type HeaderButtonType = {
  title: string,
  onPress: (props: ActionParams) => void,
};

const actionHeaderSheetButtons: HeaderButtonType[] = [
  { title: 'Unmute topic', onPress: doUnmuteTopic },
  { title: 'Mute topic', onPress: doMuteTopic },
  { title: 'Mute stream', onPress: doMuteStream },
  { title: 'Unmute stream', onPress: doUnmuteStream },
  { title: 'Cancel', onPress: () => {} },
];

type ConstructSheetParams = {
  backgroundData: BackgroundData,
  message: Message,
  narrow: Narrow,
  getString: (value: string) => string,
};

export const constructHeaderActionButtons = ({
  backgroundData: { mute, subscriptions },
  message,
  getString,
}: ConstructSheetParams) => {
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
  backgroundData: { auth, flags },
  message,
  narrow,
  getString,
}: ConstructSheetParams) => {
  const buttons = actionSheetButtons
    .filter(x => !x.onlyIf || x.onlyIf({ message, auth, narrow }))
    .map(x => getString(x.title));
  if (!isAnOutboxMessage(message)) {
    if (message.id in flags.starred) {
      buttons.push(getString('Unstar message'));
    } else {
      buttons.push(getString('Star message'));
    }
  }
  buttons.push(getString('Cancel'));
  return buttons;
};

export const constructActionButtons = (target: string) =>
  target === 'header' ? constructHeaderActionButtons : constructMessageActionButtons;

const executeActionSheetAction = (
  isHeader: boolean,
  title: string,
  { getString, ...props }: ActionParams,
) => {
  if (isHeader) {
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

/** Invoke the given callback to show an appropriate action sheet. */
export const showActionSheet = (
  isHeader: boolean,
  dispatch: Dispatch,
  showActionSheetWithOptions: (
    { options: string[], cancelButtonIndex: number },
    (number) => void,
  ) => void,
  params: ConstructSheetParams,
): void => {
  const options = constructActionButtons(isHeader ? 'header' : 'message')(params);
  const callback = buttonIndex => {
    executeActionSheetAction(isHeader, options[buttonIndex], {
      dispatch,
      subscriptions: params.backgroundData.subscriptions,
      auth: params.backgroundData.auth,
      ...params,
    });
  };
  showActionSheetWithOptions(
    {
      options,
      cancelButtonIndex: options.length - 1,
    },
    callback,
  );
};
