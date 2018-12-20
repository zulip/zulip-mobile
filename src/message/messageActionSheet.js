/* @flow strict-local */
import { Clipboard, Share } from 'react-native';
import type { Auth, Dispatch, GetText, Message, Narrow, Subscription } from '../types';
import type { BackgroundData } from '../webview/MessageList';
import { getNarrowFromMessage, isHomeNarrow, isSpecialNarrow } from '../utils/narrow';
import { isTopicMuted } from '../utils/message';
/* eslint-disable import/no-named-as-default-member */
import api, { getMessageContentById, toggleMuteStream, toggleMessageStarred } from '../api';
import { showToast } from '../utils/info';
import { doNarrow, deleteOutboxMessage, navigateToEmojiPicker } from '../actions';

/** Description of a possible option for the action sheet. */
type ButtonDescription = {
  /** The callback. */
  ({
    auth: Auth,
    message: Message,
    subscriptions: Subscription[],
    dispatch: Dispatch,
    onEditMessageSelect: (editMessage: Message) => Promise<void>,
    _: GetText,
  }): void | Promise<void>,
  title: string,
};

const isAnOutboxMessage = (message: Message): boolean => message.isOutbox;

//
// Options for the action sheet go below: ...
//

const reply = ({ message, dispatch, auth }) => {
  dispatch(doNarrow(getNarrowFromMessage(message, auth.email), message.id));
};
reply.title = 'Reply';

const copyToClipboard = async ({ _, auth, message }) => {
  const rawMessage = isAnOutboxMessage(message) /* $FlowFixMe: then really type Outbox */
    ? message.markdownContent
    : await getMessageContentById(auth, message.id);
  Clipboard.setString(rawMessage);
  showToast(_('Message copied'));
};
copyToClipboard.title = 'Copy to clipboard';

const editMessage = async ({ message, onEditMessageSelect }) => {
  onEditMessageSelect(message);
};
editMessage.title = 'Edit message';

const deleteMessage = async ({ auth, message, dispatch }) => {
  if (isAnOutboxMessage(message)) {
    dispatch(deleteOutboxMessage(message.timestamp));
  } else {
    api.deleteMessage(auth, message.id);
  }
};
deleteMessage.title = 'Delete message';

const unmuteTopic = ({ auth, message }) => {
  api.unmuteTopic(auth, message.display_recipient, message.subject);
};
unmuteTopic.title = 'Unmute topic';

const muteTopic = ({ auth, message }) => {
  api.muteTopic(auth, message.display_recipient, message.subject);
};
muteTopic.title = 'Mute topic';

const unmuteStream = ({ auth, message, subscriptions }) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    toggleMuteStream(auth, sub.stream_id, false);
  }
};
unmuteStream.title = 'Unmute stream';

const muteStream = ({ auth, message, subscriptions }) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    toggleMuteStream(auth, sub.stream_id, true);
  }
};
muteStream.title = 'Mute stream';

const starMessage = ({ auth, message }) => {
  toggleMessageStarred(auth, [message.id], true);
};
starMessage.title = 'Star message';

const unstarMessage = ({ auth, message }) => {
  toggleMessageStarred(auth, [message.id], false);
};
unstarMessage.title = 'Unstar message';

const shareMessage = ({ message }) => {
  Share.share({
    message: message.content.replace(/<(?:.|\n)*?>/gm, ''),
  });
};
shareMessage.title = 'Share';

const addReaction = ({ message, dispatch }) => {
  dispatch(navigateToEmojiPicker(message.id));
};
addReaction.title = 'Add a reaction';

const cancel = params => {};
cancel.title = 'Cancel';

const allButtonsRaw = {
  // For messages
  addReaction,
  reply,
  copyToClipboard,
  shareMessage,
  editMessage,
  deleteMessage,
  starMessage,
  unstarMessage,

  // For headers
  unmuteTopic,
  muteTopic,
  muteStream,
  unmuteStream,

  // All
  cancel,
};

//
// ... End of options for the action sheet.
//

type ButtonCode = $Keys<typeof allButtonsRaw>;

const allButtons: { [ButtonCode]: ButtonDescription } = allButtonsRaw;

type ConstructSheetParams = {|
  backgroundData: BackgroundData,
  message: Message,
  narrow: Narrow,
  onEditMessageSelect: (editMessage: Message) => Promise<void>,
|};

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
    allButtons[optionCodes[buttonIndex]]({
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
