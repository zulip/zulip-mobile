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
  _: GetText,
};

const isAnOutboxMessage = (message: Message): boolean => message.isOutbox;

const reply = ({ message, dispatch, auth }: ActionParams) => {
  dispatch(doNarrow(getNarrowFromMessage(message, auth.email), message.id));
};

const copyToClipboard = async ({ _, auth, message }: ActionParams) => {
  const rawMessage = isAnOutboxMessage(message) /* $FlowFixMe: then really type Outbox */
    ? message.markdownContent
    : await getMessageContentById(auth, message.id);
  Clipboard.setString(rawMessage);
  showToast(_('Message copied'));
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

type ButtonDescription = {
  title: string,
  onPress: ActionParams => void | Promise<void>,
};

const allButtonsRaw = {
  // For messages
  addReaction: {
    title: 'Add a reaction',
    onPress: addReaction,
  },
  reply: { title: 'Reply', onPress: reply },
  copyToClipboard: { title: 'Copy to clipboard', onPress: copyToClipboard },
  shareMessage: { title: 'Share', onPress: shareMessage },
  editMessage: {
    title: 'Edit message',
    onPress: editMessage,
  },
  deleteMessage: {
    title: 'Delete message',
    onPress: doDeleteMessage,
  },
  starMessage: { title: 'Star message', onPress: starMessage },
  unstarMessage: { title: 'Unstar message', onPress: unstarMessage },

  // For headers
  unmuteTopic: { title: 'Unmute topic', onPress: doUnmuteTopic },
  muteTopic: { title: 'Mute topic', onPress: doMuteTopic },
  muteStream: { title: 'Mute stream', onPress: doMuteStream },
  unmuteStream: { title: 'Unmute stream', onPress: doUnmuteStream },

  // All
  cancel: { title: 'Cancel', onPress: () => {} },
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
}: ConstructSheetParams): ButtonCode[] => {
  const buttons: ButtonCode[] = [];
  if (message.type === 'stream') {
    if (isTopicMuted(message.display_recipient, message.subject, mute)) {
      buttons.push('unmuteTopic');
    } else {
      buttons.push('muteTopic');
    }
    const sub = subscriptions.find(x => x.name === message.display_recipient);
    if (sub && !sub.in_home_view) {
      buttons.push('unmuteStream');
    } else {
      buttons.push('muteStream');
    }
  }
  buttons.push('cancel');
  return buttons;
};

const messageNotDeleted = (message: Message): boolean => message.content !== '<p>(deleted)</p>';

export const constructMessageActionButtons = ({
  backgroundData: { auth, flags },
  message,
  narrow,
}: ConstructSheetParams): ButtonCode[] => {
  const buttons = [];
  if (!isAnOutboxMessage(message) && messageNotDeleted(message)) {
    buttons.push('addReaction');
  }
  if (!isAnOutboxMessage(message)) {
    buttons.push('reply');
  }
  if (messageNotDeleted(message)) {
    buttons.push('copyToClipboard');
    buttons.push('shareMessage');
  }
  if (
    !isAnOutboxMessage(message)
    && message.sender_email === auth.email
    && !isHomeNarrow(narrow)
    && !isSpecialNarrow(narrow)
  ) {
    buttons.push('editMessage');
  }
  if (message.sender_email === auth.email && messageNotDeleted(message)) {
    buttons.push('deleteMessage');
  }
  if (!isAnOutboxMessage(message)) {
    if (message.id in flags.starred) {
      buttons.push('unstarMessage');
    } else {
      buttons.push('starMessage');
    }
  }
  buttons.push('cancel');
  return buttons;
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
  const optionCodes = isHeader
    ? constructHeaderActionButtons(params)
    : constructMessageActionButtons(params);
  const callback = buttonIndex => {
    allButtons[optionCodes[buttonIndex]].onPress({
      dispatch,
      subscriptions: params.backgroundData.subscriptions,
      auth: params.backgroundData.auth,
      _,
      ...params,
    });
  };
  showActionSheetWithOptions(
    {
      options: optionCodes.map(code => _(allButtons[code].title)),
      cancelButtonIndex: optionCodes.length - 1,
    },
    callback,
  );
};
