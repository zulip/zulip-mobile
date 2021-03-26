/* @flow strict-local */
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
import { deleteMessagesForTopic } from '../topics/topicActions';
import * as logging from '../utils/logging';

// TODO really this belongs in a libdef.
export type ShowActionSheetWithOptions = (
  { options: string[], cancelButtonIndex: number, ... },
  (number) => void,
) => void;

type HeaderArgs = {
  auth: Auth,
  stream: string,
  topic: string,
  subscriptions: Subscription[],
  dispatch: Dispatch,
  _: GetText,
  ...
};

type MessageArgs = {
  auth: Auth,
  ownUser: User,
  message: Message | Outbox,
  dispatch: Dispatch,
  _: GetText,
  startEditMessage: (editMessage: EditMessage) => void,
  ...
};

type Button<Args: HeaderArgs | MessageArgs> = {|
  (Args): void | Promise<void>,
  title: string,

  /** The title of the alert-box that will be displayed if the callback throws. */
  // Required even when the callback can't throw (e.g., "Cancel"), since we can't
  // otherwise ensure that everything that _can_ throw has one.
  errorMessage: string,
|};

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

const unmuteTopic = async ({ auth, stream, topic }) => {
  await api.unmuteTopic(auth, stream, topic);
};
unmuteTopic.title = 'Unmute topic';
unmuteTopic.errorMessage = 'Failed to unmute topic';

const muteTopic = async ({ auth, stream, topic }) => {
  await api.muteTopic(auth, stream, topic);
};
muteTopic.title = 'Mute topic';
muteTopic.errorMessage = 'Failed to mute topic';

const deleteTopic = async ({ auth, stream, topic, dispatch, _ }) => {
  const alertTitle = _('Are you sure you want to delete the topic “{topic}”?', { topic });
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
    await dispatch(deleteMessagesForTopic(stream, topic));
  }
};
deleteTopic.title = 'Delete topic';
deleteTopic.errorMessage = 'Failed to delete topic';

const unmuteStream = async ({ auth, stream, subscriptions }) => {
  const sub = subscriptions.find(x => x.name === stream);
  if (sub) {
    await api.toggleMuteStream(auth, sub.stream_id, false);
  }
};
unmuteStream.title = 'Unmute stream';
unmuteStream.errorMessage = 'Failed to unmute stream';

const muteStream = async ({ auth, stream, subscriptions }) => {
  const sub = subscriptions.find(x => x.name === stream);
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

export const constructHeaderActionButtons = ({
  backgroundData: { mute, subscriptions, ownUser },
  stream,
  topic,
}: {|
  backgroundData: $ReadOnly<{
    mute: MuteState,
    subscriptions: Subscription[],
    ownUser: User,
    ...
  }>,
  stream: string,
  topic: string,
|}): Button<HeaderArgs>[] => {
  const buttons = [];
  if (ownUser.is_admin) {
    buttons.push(deleteTopic);
  }
  if (isTopicMuted(stream, topic, mute)) {
    buttons.push(unmuteTopic);
  } else {
    buttons.push(muteTopic);
  }
  const sub = subscriptions.find(x => x.name === stream);
  if (sub && !sub.in_home_view) {
    buttons.push(unmuteStream);
  } else {
    buttons.push(muteStream);
  }
  buttons.push(cancel);
  return buttons;
};

export const constructOutboxActionButtons = (): Button<MessageArgs>[] => {
  const buttons = [];
  buttons.push(copyToClipboard);
  buttons.push(shareMessage);
  buttons.push(deleteMessage);
  buttons.push(cancel);
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
    ...
  }>,
  message: Message,
  narrow: Narrow,
}): Button<MessageArgs>[] => {
  const buttons = [];
  if (messageNotDeleted(message)) {
    buttons.push(addReaction);
  }
  if (message.reactions.length > 0) {
    buttons.push(showReactions);
  }
  if (!isTopicNarrow(narrow) && !isPmNarrow(narrow)) {
    buttons.push(reply);
  }
  if (messageNotDeleted(message)) {
    buttons.push(copyToClipboard);
    buttons.push(shareMessage);
  }
  if (
    message.sender_id === ownUser.user_id
    // Our "edit message" UI only works in certain kinds of narrows.
    && (isStreamOrTopicNarrow(narrow) || isPmNarrow(narrow))
  ) {
    buttons.push(editMessage);
  }
  if (message.sender_id === ownUser.user_id && messageNotDeleted(message)) {
    buttons.push(deleteMessage);
  }
  if (message.id in flags.starred) {
    buttons.push(unstarMessage);
  } else {
    buttons.push(starMessage);
  }
  buttons.push(cancel);
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
|}): Button<MessageArgs>[] => {
  if (message.isOutbox) {
    return constructOutboxActionButtons();
  } else {
    return constructMessageActionButtons({ backgroundData, message, narrow });
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
    ...
  }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): void => {
  const buttonList = constructNonHeaderActionButtons({ backgroundData, message, narrow });
  const callback = buttonIndex => {
    (async () => {
      const pressedButton: Button<MessageArgs> = buttonList[buttonIndex];
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
      options: buttonList.map(button => callbacks._(button.title)),
      cancelButtonIndex: buttonList.length - 1,
    },
    callback,
  );
};

export const showHeaderActionSheet = ({
  showActionSheetWithOptions,
  callbacks,
  backgroundData,
  topic,
  stream,
}: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    mute: MuteState,
    subscriptions: Subscription[],
    ownUser: User,
    flags: FlagsState,
    ...
  }>,
  stream: string,
  topic: string,
|}): void => {
  const buttonList = constructHeaderActionButtons({
    backgroundData,
    stream,
    topic,
  });
  const callback = buttonIndex => {
    (async () => {
      const pressedButton: Button<HeaderArgs> = buttonList[buttonIndex];
      try {
        await pressedButton({
          ...backgroundData,
          ...callbacks,
          stream,
          topic,
        });
      } catch (err) {
        Alert.alert(callbacks._(pressedButton.errorMessage), err.message);
      }
    })();
  };
  showActionSheetWithOptions(
    {
      title: `#${stream} > ${topic}`,
      options: buttonList.map(button => callbacks._(button.title)),
      cancelButtonIndex: buttonList.length - 1,
    },
    callback,
  );
};
