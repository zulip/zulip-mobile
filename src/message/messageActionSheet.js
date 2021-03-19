/* @flow strict-local */
import invariant from 'invariant';
import { Clipboard, Share, Alert } from 'react-native';

import * as NavigationService from '../nav/NavigationService';
import type {
  Auth,
  Dispatch,
  FlagsState,
  GetText,
  Message,
  MuteState,
  Narrow,
  Outbox,
  Subscription,
  User,
  EditMessage,
} from '../types';
import {
  getNarrowForReply,
  isPmNarrow,
  isStreamOrTopicNarrow,
  isTopicNarrow,
} from '../utils/narrow';
import { isTopicMuted } from '../utils/message';
import * as api from '../api';
import { showToast } from '../utils/info';
import { doNarrow, deleteOutboxMessage, navigateToEmojiPicker } from '../actions';
import { navigateToMessageReactionScreen } from '../nav/navActions';
import { pmUiRecipientsFromMessage, streamNameOfStreamMessage } from '../utils/recipient';
import { deleteMessagesForTopic } from '../topics/topicActions';
import * as logging from '../utils/logging';

// TODO really this belongs in a libdef.
export type ShowActionSheetWithOptions = (
  { options: string[], cancelButtonIndex: number, ... },
  (number) => void,
) => void;

/** Description of a possible option for the action sheet. */
type ButtonDescription = {
  /** The callback. */
  ({
    auth: Auth,
    ownUser: User,
    message: Message | Outbox,
    subscriptions: Subscription[],
    dispatch: Dispatch,
    _: GetText,
    startEditMessage: (editMessage: EditMessage) => void,
    ...
  }): void | Promise<void>,
  title: string,

  /** The title of the alert-box that will be displayed if the callback throws. */
  // Required even when the callback can't throw (e.g., "Cancel"), since we can't
  // otherwise ensure that everything that _can_ throw has one.
  errorMessage: string,
  ...
};

//
// Options for the action sheet go below: ...
//

const reply = ({ message, dispatch, ownUser }) => {
  dispatch(doNarrow(getNarrowForReply(message, ownUser.user_id), message.id));
};
reply.title = 'Reply';
reply.errorMessage = 'Failed to reply';

const copyToClipboard = async ({ _, auth, message }) => {
  const rawMessage = message.isOutbox
    ? message.markdownContent
    : (await api.getRawMessageContent(auth, message.id)).raw_content;
  Clipboard.setString(rawMessage);
  showToast(_('Message copied'));
};
copyToClipboard.title = 'Copy to clipboard';
copyToClipboard.errorMessage = 'Failed to copy message to clipboard';

const editMessage = async ({ message, dispatch, startEditMessage, auth }) => {
  if (message.isOutbox) {
    logging.warn('Attempted "Edit message" for outbox message');
    return;
  }

  const { raw_content } = await api.getRawMessageContent(auth, message.id);
  startEditMessage({
    id: message.id,
    content: raw_content,
    topic: message.subject,
  });
};
editMessage.title = 'Edit message';
editMessage.errorMessage = 'Failed to edit message';

const deleteMessage = async ({ auth, message, dispatch }) => {
  if (message.isOutbox) {
    dispatch(deleteOutboxMessage(message.timestamp));
  } else {
    await api.deleteMessage(auth, message.id);
  }
};
deleteMessage.title = 'Delete message';
deleteMessage.errorMessage = 'Failed to delete message';

const unmuteTopic = async ({ auth, message }) => {
  invariant(message.type === 'stream', 'unmuteTopic: got PM');
  await api.unmuteTopic(auth, streamNameOfStreamMessage(message), message.subject);
};
unmuteTopic.title = 'Unmute topic';
unmuteTopic.errorMessage = 'Failed to unmute topic';

const muteTopic = async ({ auth, message }) => {
  invariant(message.type === 'stream', 'muteTopic: got PM');
  await api.muteTopic(auth, streamNameOfStreamMessage(message), message.subject);
};
muteTopic.title = 'Mute topic';
muteTopic.errorMessage = 'Failed to mute topic';

const deleteTopic = async ({ auth, message, dispatch, _ }) => {
  invariant(message.type === 'stream', 'deleteTopic: got PM');
  const alertTitle = _('Are you sure you want to delete the topic “{topic}”?', {
    topic: message.subject,
  });
  const AsyncAlert = async (): Promise<boolean> =>
    new Promise((resolve, reject) => {
      Alert.alert(
        alertTitle,
        _('This will also delete all messages in the topic.'),
        [
          {
            text: _('Delete topic'),
            onPress: () => {
              resolve(true);
            },
            style: 'destructive',
          },
          {
            text: _('Cancel'),
            onPress: () => {
              resolve(false);
            },
            style: 'cancel',
          },
        ],
        { cancelable: true },
      );
    });
  if (await AsyncAlert()) {
    await dispatch(deleteMessagesForTopic(streamNameOfStreamMessage(message), message.subject));
  }
};
deleteTopic.title = 'Delete topic';
deleteTopic.errorMessage = 'Failed to delete topic';

const unmuteStream = async ({ auth, message, subscriptions }) => {
  invariant(message.type === 'stream', 'unmuteStream: got PM');
  const sub = subscriptions.find(x => x.name === streamNameOfStreamMessage(message));
  if (sub) {
    await api.toggleMuteStream(auth, sub.stream_id, false);
  }
};
unmuteStream.title = 'Unmute stream';
unmuteStream.errorMessage = 'Failed to unmute stream';

const muteStream = async ({ auth, message, subscriptions }) => {
  invariant(message.type === 'stream', 'muteStream: got PM');
  const sub = subscriptions.find(x => x.name === streamNameOfStreamMessage(message));
  if (sub) {
    await api.toggleMuteStream(auth, sub.stream_id, true);
  }
};
muteStream.title = 'Mute stream';
muteStream.errorMessage = 'Failed to mute stream';

const starMessage = async ({ auth, message }) => {
  await api.toggleMessageStarred(auth, [message.id], true);
};
starMessage.title = 'Star message';
starMessage.errorMessage = 'Failed to star message';

const unstarMessage = async ({ auth, message }) => {
  await api.toggleMessageStarred(auth, [message.id], false);
};
unstarMessage.title = 'Unstar message';
unstarMessage.errorMessage = 'Failed to unstar message';

const shareMessage = ({ message }) => {
  Share.share({
    message: message.content.replace(/<(?:.|\n)*?>/gm, ''),
  });
};
shareMessage.title = 'Share';
shareMessage.errorMessage = 'Failed to share message';

const addReaction = ({ message, dispatch }) => {
  NavigationService.dispatch(navigateToEmojiPicker(message.id));
};
addReaction.title = 'Add a reaction';
addReaction.errorMessage = 'Failed to add reaction';

const showReactions = ({ message, dispatch }) => {
  NavigationService.dispatch(navigateToMessageReactionScreen(message.id));
};
showReactions.title = 'See who reacted';
showReactions.errorMessage = 'Failed to show reactions';

const cancel = params => {};
cancel.title = 'Cancel';
cancel.errorMessage = 'Failed to hide menu';

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
  showReactions,

  // For headers
  unmuteTopic,
  muteTopic,
  deleteTopic,
  muteStream,
  unmuteStream,

  // All
  cancel,
};

//
// ... End of options for the action sheet.
//

type ButtonCode = $Keys<typeof allButtonsRaw>;

const allButtons: {| [ButtonCode]: ButtonDescription |} = allButtonsRaw;

export const constructHeaderActionButtons = ({
  backgroundData: { mute, subscriptions, ownUser },
  message,
  narrow,
}: {|
  backgroundData: $ReadOnly<{
    mute: MuteState,
    subscriptions: Subscription[],
    ownUser: User,
    ...
  }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): ButtonCode[] => {
  const buttons: ButtonCode[] = [];
  if (message.type === 'stream') {
    if (ownUser.is_admin) {
      buttons.push('deleteTopic');
    }
    const streamName = streamNameOfStreamMessage(message);
    if (isTopicMuted(streamName, message.subject, mute)) {
      buttons.push('unmuteTopic');
    } else {
      buttons.push('muteTopic');
    }
    const sub = subscriptions.find(x => x.name === streamName);
    if (sub && !sub.in_home_view) {
      buttons.push('unmuteStream');
    } else {
      buttons.push('muteStream');
    }
  }
  buttons.push('cancel');
  return buttons;
};

export const constructOutboxActionButtons = (): ButtonCode[] => {
  const buttons = [];
  buttons.push('copyToClipboard');
  buttons.push('shareMessage');
  buttons.push('deleteMessage');
  buttons.push('cancel');
  return buttons;
};

const messageNotDeleted = (message: Message | Outbox): boolean =>
  message.content !== '<p>(deleted)</p>';

export const constructMessageActionButtons = ({
  backgroundData: { ownUser, flags },
  message,
  narrow,
}: {
  backgroundData: $ReadOnly<{
    ownUser: User,
    flags: FlagsState,
  }>,
  message: Message,
  narrow: Narrow,
}): ButtonCode[] => {
  const buttons = [];
  if (messageNotDeleted(message)) {
    buttons.push('addReaction');
  }
  if (message.reactions.length > 0) {
    buttons.push('showReactions');
  }
  if (!isTopicNarrow(narrow) && !isPmNarrow(narrow)) {
    buttons.push('reply');
  }
  if (messageNotDeleted(message)) {
    buttons.push('copyToClipboard');
    buttons.push('shareMessage');
  }
  if (
    message.sender_id === ownUser.user_id
    // Our "edit message" UI only works in certain kinds of narrows.
    && (isStreamOrTopicNarrow(narrow) || isPmNarrow(narrow))
  ) {
    buttons.push('editMessage');
  }
  if (message.sender_id === ownUser.user_id && messageNotDeleted(message)) {
    buttons.push('deleteMessage');
  }
  if (message.id in flags.starred) {
    buttons.push('unstarMessage');
  } else {
    buttons.push('starMessage');
  }
  buttons.push('cancel');
  return buttons;
};

export const constructNonHeaderActionButtons = ({
  backgroundData,
  message,
  narrow,
}: {|
  backgroundData: $ReadOnly<{
    ownUser: User,
    flags: FlagsState,
    ...
  }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): ButtonCode[] => {
  if (message.isOutbox) {
    return constructOutboxActionButtons();
  } else {
    return constructMessageActionButtons({ backgroundData, message, narrow });
  }
};

/** Returns the title for the action sheet. */
const getActionSheetTitle = (message: Message | Outbox, ownUser: User): string => {
  if (message.type === 'private') {
    const recipients = pmUiRecipientsFromMessage(message, ownUser.user_id);
    return recipients
      .map(r => r.full_name)
      .sort()
      .join(', ');
  } else {
    return `#${streamNameOfStreamMessage(message)} > ${message.subject}`;
  }
};

export const showMessageActionSheet = ({
  showActionSheetWithOptions,
  callbacks,
  backgroundData,
  message,
  narrow,
}: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    startEditMessage: (editMessage: EditMessage) => void,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    subscriptions: Subscription[],
    ownUser: User,
    flags: FlagsState,
  }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): void => {
  const optionCodes = constructNonHeaderActionButtons({ backgroundData, message, narrow });
  const callback = buttonIndex => {
    (async () => {
      const pressedButton: ButtonDescription = allButtons[optionCodes[buttonIndex]];
      try {
        await pressedButton({
          ...backgroundData,
          ...callbacks,
          message,
          narrow,
        });
      } catch (err) {
        Alert.alert(callbacks._(pressedButton.errorMessage), err.message);
      }
    })();
  };
  showActionSheetWithOptions(
    {
      options: optionCodes.map(code => callbacks._(allButtons[code].title)),
      cancelButtonIndex: optionCodes.length - 1,
    },
    callback,
  );
};

export const showHeaderActionSheet = ({
  showActionSheetWithOptions,
  callbacks,
  backgroundData,
  message,
  narrow,
}: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    startEditMessage: (editMessage: EditMessage) => void,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    mute: MuteState,
    subscriptions: Subscription[],
    ownUser: User,
    flags: FlagsState,
  }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): void => {
  const optionCodes = constructHeaderActionButtons({ backgroundData, message, narrow });
  const callback = buttonIndex => {
    (async () => {
      const pressedButton: ButtonDescription = allButtons[optionCodes[buttonIndex]];
      try {
        await pressedButton({
          ...backgroundData,
          ...callbacks,
          message,
        });
      } catch (err) {
        Alert.alert(callbacks._(pressedButton.errorMessage), err.message);
      }
    })();
  };
  showActionSheetWithOptions(
    {
      title: getActionSheetTitle(message, backgroundData.ownUser),
      options: optionCodes.map(code => callbacks._(allButtons[code].title)),
      cancelButtonIndex: optionCodes.length - 1,
    },
    callback,
  );
};
