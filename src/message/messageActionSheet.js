/* @flow strict-local */
import { Clipboard, Share, Alert } from 'react-native';
import type {
  Auth,
  Dispatch,
  GetText,
  Message,
  Narrow,
  Outbox,
  Subscription,
  User,
  EditMessage,
} from '../types';
import type { BackgroundData } from '../webview/MessageList';
import {
  getNarrowFromMessage,
  isPrivateOrGroupNarrow,
  isStreamOrTopicNarrow,
  isTopicNarrow,
  isSameNarrow,
} from '../utils/narrow';
import { isTopicMuted } from '../utils/message';
import * as api from '../api';
import { showToast } from '../utils/info';
import { doNarrow, deleteOutboxMessage, navigateToEmojiPicker } from '../actions';
import { navigateToMessageReactionScreen } from '../nav/navActions';
import { pmUiRecipientsFromMessage } from '../utils/recipient';
import { deleteMessagesForTopic } from '../topics/topicActions';
import * as logging from '../utils/logging';

// TODO really this belongs in a libdef.
export type ShowActionSheetWithOptions = (
  { options: string[], cancelButtonIndex: number },
  (number) => void,
) => void;

/** Description of a possible option for the action sheet. */
type ButtonDescription = {
  /** The callback. */
  ({
    auth: Auth,
    ownEmail: string,
    message: Message | Outbox,
    subscriptions: Subscription[],
    dispatch: Dispatch,
    narrow: Narrow,
    _: GetText,
    startEditMessage: (editMessage: EditMessage) => void,
    replyWithMention: (fullName: string, senderId: number, topic?: string) => void,
  }): void | Promise<void>,
  title: string,

  /** The title of the alert-box that will be displayed if the callback throws. */
  // Required even when the callback can't throw (e.g., "Cancel"), since we can't
  // otherwise ensure that everything that _can_ throw has one.
  errorMessage: string,
};

//
// Options for the action sheet go below: ...
//

const reply = ({ message, dispatch, ownEmail }) => {
  dispatch(doNarrow(getNarrowFromMessage(message, ownEmail), message.id));
};
reply.title = 'Reply';
reply.errorMessage = 'Failed to reply';

const mentionAndReply = ({ message, ownEmail, narrow, replyWithMention }) => {
  if (message.isOutbox) {
    logging.warn('Attempted "Reply with mention" for outbox message');
    return;
  }

  const messageNarrow = getNarrowFromMessage(message, ownEmail);
  if (!isSameNarrow(messageNarrow, narrow)) {
    replyWithMention(message.sender_full_name, message.sender_id, message.subject);
    return;
  }

  replyWithMention(message.sender_full_name, message.sender_id);
};
mentionAndReply.title = 'Reply with mention';
mentionAndReply.errorMessage = 'Failed to reply with mention';

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
  await api.unmuteTopic(auth, message.display_recipient, message.subject);
};
unmuteTopic.title = 'Unmute topic';
unmuteTopic.errorMessage = 'Failed to unmute topic';

const muteTopic = async ({ auth, message }) => {
  await api.muteTopic(auth, message.display_recipient, message.subject);
};
muteTopic.title = 'Mute topic';
muteTopic.errorMessage = 'Failed to mute topic';

const deleteTopic = async ({ auth, message, dispatch, ownEmail, _ }) => {
  const alertTitle = _.intl.formatMessage(
    {
      id: "Are you sure you want to delete the topic '{topic}'?",
      defaultMessage: "Are you sure you want to delete the topic '{topic}'?",
    },
    { topic: message.subject },
  );
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
    await dispatch(deleteMessagesForTopic(message.display_recipient, message.subject));
  }
};
deleteTopic.title = 'Delete topic';
deleteTopic.errorMessage = 'Failed to delete topic';

const unmuteStream = async ({ auth, message, subscriptions }) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    await api.toggleMuteStream(auth, sub.stream_id, false);
  }
};
unmuteStream.title = 'Unmute stream';
unmuteStream.errorMessage = 'Failed to unmute stream';

const muteStream = async ({ auth, message, subscriptions }) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
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
  dispatch(navigateToEmojiPicker(message.id));
};
addReaction.title = 'Add a reaction';
addReaction.errorMessage = 'Failed to add reaction';

const showReactions = ({ message, dispatch }) => {
  dispatch(navigateToMessageReactionScreen(message.id));
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
  mentionAndReply,
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

const allButtons: { [ButtonCode]: ButtonDescription } = allButtonsRaw;

type ConstructSheetParams<MsgType: Message | Outbox = Message | Outbox> = {|
  backgroundData: BackgroundData,
  message: MsgType,
  narrow: Narrow,
|};

export const constructHeaderActionButtons = ({
  backgroundData: { mute, subscriptions, ownUser },
  message,
}: ConstructSheetParams<>): ButtonCode[] => {
  const buttons: ButtonCode[] = [];
  if (message.type === 'stream') {
    if (ownUser.is_admin) {
      buttons.push('deleteTopic');
    }
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

export const constructOutboxActionButtons = ({
  backgroundData,
  message,
  narrow,
}: ConstructSheetParams<Outbox>): ButtonCode[] => {
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
}: ConstructSheetParams<Message>): ButtonCode[] => {
  const buttons = [];
  if (messageNotDeleted(message)) {
    buttons.push('addReaction');
  }
  if (message.reactions.length > 0) {
    buttons.push('showReactions');
  }
  if (!isTopicNarrow(narrow) && !isPrivateOrGroupNarrow(narrow)) {
    buttons.push('reply');
  }
  if (isStreamOrTopicNarrow(narrow) || isPrivateOrGroupNarrow(narrow)) {
    buttons.push('mentionAndReply');
  }
  if (messageNotDeleted(message)) {
    buttons.push('copyToClipboard');
    buttons.push('shareMessage');
  }
  if (
    message.sender_email === ownUser.email
    // Our "edit message" UI only works in certain kinds of narrows.
    && (isStreamOrTopicNarrow(narrow) || isPrivateOrGroupNarrow(narrow))
  ) {
    buttons.push('editMessage');
  }
  if (message.sender_email === ownUser.email && messageNotDeleted(message)) {
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
}: ConstructSheetParams<>): ButtonCode[] => {
  if (message.isOutbox) {
    return constructOutboxActionButtons({ backgroundData, message, narrow });
  } else {
    return constructMessageActionButtons({ backgroundData, message, narrow });
  }
};

/** Returns the title for the action sheet. */
const getActionSheetTitle = (message: Message | Outbox, ownUser: User): string => {
  if (message.type === 'private') {
    const recipients = pmUiRecipientsFromMessage(message, ownUser);
    return recipients
      .map(r => r.full_name)
      .sort()
      .join(', ');
  } else {
    return `#${message.display_recipient} > ${message.subject}`;
  }
};

/** Invoke the given callback to show an appropriate action sheet. */
export const showActionSheet = (
  isHeader: boolean,
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    startEditMessage: (editMessage: EditMessage) => void,
    replyWithMention: (fullName: string, senderId: number, topic?: string) => void,

    _: GetText,
  |},
  params: ConstructSheetParams<>,
): void => {
  const optionCodes = isHeader
    ? constructHeaderActionButtons(params)
    : constructNonHeaderActionButtons(params);
  const callback = buttonIndex => {
    (async () => {
      const pressedButton: ButtonDescription = allButtons[optionCodes[buttonIndex]];
      try {
        await pressedButton({
          subscriptions: params.backgroundData.subscriptions,
          auth: params.backgroundData.auth,
          ownEmail: params.backgroundData.ownUser.email,
          ...params,
          ...callbacks,
        });
      } catch (err) {
        Alert.alert(callbacks._(pressedButton.errorMessage), err.message);
      }
    })();
  };
  showActionSheetWithOptions(
    {
      ...(isHeader
        ? {
            title: getActionSheetTitle(params.message, params.backgroundData.ownUser),
          }
        : {}),
      options: optionCodes.map(code => callbacks._(allButtons[code].title)),
      cancelButtonIndex: optionCodes.length - 1,
    },
    callback,
  );
};
