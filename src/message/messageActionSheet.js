/* @flow strict-local */
import { Clipboard, Share, Alert } from 'react-native';
import invariant from 'invariant';

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
  Stream,
} from '../types';
import type { UnreadState } from '../unread/unreadModelTypes';
import {
  getNarrowForReply,
  isPmNarrow,
  isStreamOrTopicNarrow,
  isTopicNarrow,
} from '../utils/narrow';
import { isTopicMuted } from '../utils/message';
import * as api from '../api';
import { showToast } from '../utils/info';
import { doNarrow, deleteOutboxMessage, navigateToEmojiPicker, navigateToStream } from '../actions';
import { navigateToMessageReactionScreen } from '../nav/navActions';
import { deleteMessagesForTopic } from '../topics/topicActions';
import * as logging from '../utils/logging';
import { getUnreadCountForTopic } from '../unread/unreadModel';

// TODO really this belongs in a libdef.
export type ShowActionSheetWithOptions = (
  { options: string[], cancelButtonIndex: number, ... },
  (number) => void,
) => void;

type TopicArgs = {
  auth: Auth,
  streamId: number,
  topic: string,
  subscriptions: Subscription[],
  streams: Map<number, Stream>,
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

type Button<Args: TopicArgs | MessageArgs> = {|
  (Args): void | Promise<void>,

  /** The label for the button. */
  // This UI string should be represented in messages_en.json.
  title: string,

  /** The title of the alert-box that will be displayed if the
   * callback throws. */
  // Required even when the callback can't throw (e.g., "Cancel"),
  // since we can't otherwise ensure that everything that _can_ throw
  // has one.
  //
  // This UI string should be represented in messages_en.json.
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

const markTopicAsRead = async ({ auth, streamId, topic }) => {
  await api.markTopicAsRead(auth, streamId, topic);
};
markTopicAsRead.title = 'Mark topic as read';
markTopicAsRead.errorMessage = 'Failed to mark topic as read';

const unmuteTopic = async ({ auth, streamId, topic, streams }) => {
  const stream = streams.get(streamId);
  invariant(stream !== undefined, 'Stream with provided streamId must exist.');
  await api.setTopicMute(auth, stream.name, topic, false);
};
unmuteTopic.title = 'Unmute topic';
unmuteTopic.errorMessage = 'Failed to unmute topic';

const muteTopic = async ({ auth, streamId, topic, streams }) => {
  const stream = streams.get(streamId);
  invariant(stream !== undefined, 'Stream with provided streamId must exist.');
  await api.setTopicMute(auth, stream.name, topic, true);
};
muteTopic.title = 'Mute topic';
muteTopic.errorMessage = 'Failed to mute topic';

const deleteTopic = async ({ auth, streamId, topic, dispatch, _ }) => {
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
    await dispatch(deleteMessagesForTopic(streamId, topic));
  }
};
deleteTopic.title = 'Delete topic';
deleteTopic.errorMessage = 'Failed to delete topic';

const unmuteStream = async ({ auth, streamId, subscriptions }) => {
  await api.setSubscriptionProperty(auth, streamId, 'is_muted', false);
};
unmuteStream.title = 'Unmute stream';
unmuteStream.errorMessage = 'Failed to unmute stream';

const muteStream = async ({ auth, streamId, subscriptions }) => {
  await api.setSubscriptionProperty(auth, streamId, 'is_muted', true);
};
muteStream.title = 'Mute stream';
muteStream.errorMessage = 'Failed to mute stream';

const showStreamSettings = ({ streamId, subscriptions }) => {
  NavigationService.dispatch(navigateToStream(streamId));
};
showStreamSettings.title = 'Stream settings';
showStreamSettings.errorMessage = 'Failed to show stream settings';

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

export const constructTopicActionButtons = ({
  backgroundData: { mute, ownUser, streams, subscriptions, unread },
  streamId,
  topic,
}: {|
  backgroundData: $ReadOnly<{
    mute: MuteState,
    streams: Map<number, Stream>,
    subscriptions: Subscription[],
    unread: UnreadState,
    ownUser: User,
    ...
  }>,
  streamId: number,
  topic: string,
|}): Button<TopicArgs>[] => {
  const buttons = [];
  if (ownUser.is_admin) {
    buttons.push(deleteTopic);
  }
  const unreadCount = getUnreadCountForTopic(unread, streamId, topic);
  if (unreadCount > 0) {
    buttons.push(markTopicAsRead);
  }
  const stream = streams.get(streamId);
  invariant(stream !== undefined, 'Stream with provided streamId not found.');
  if (isTopicMuted(stream.name, topic, mute)) {
    buttons.push(unmuteTopic);
  } else {
    buttons.push(muteTopic);
  }
  const sub = subscriptions.find(x => x.stream_id === streamId);
  if (sub && !sub.in_home_view) {
    buttons.push(unmuteStream);
  } else {
    buttons.push(muteStream);
  }
  buttons.push(showStreamSettings);
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
}: {|
  backgroundData: $ReadOnly<{
    ownUser: User,
    flags: FlagsState,
    ...
  }>,
  message: Message,
  narrow: Narrow,
|}): Button<MessageArgs>[] => {
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

function makeButtonCallback<Args: TopicArgs | MessageArgs>(buttonList: Button<Args>[], args: Args) {
  return buttonIndex => {
    (async () => {
      const pressedButton: Button<Args> = buttonList[buttonIndex];
      try {
        await pressedButton(args);
      } catch (err) {
        Alert.alert(args._(pressedButton.errorMessage), err.message);
      }
    })();
  };
}

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
  showActionSheetWithOptions(
    {
      options: buttonList.map(button => callbacks._(button.title)),
      cancelButtonIndex: buttonList.length - 1,
    },
    makeButtonCallback(buttonList, {
      ...backgroundData,
      ...callbacks,
      message,
      narrow,
    }),
  );
};

export const showTopicActionSheet = ({
  showActionSheetWithOptions,
  callbacks,
  backgroundData,
  topic,
  streamId,
}: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    mute: MuteState,
    streams: Map<number, Stream>,
    subscriptions: Subscription[],
    unread: UnreadState,
    ownUser: User,
    flags: FlagsState,
    ...
  }>,
  streamId: number,
  topic: string,
|}): void => {
  const buttonList = constructTopicActionButtons({
    backgroundData,
    streamId,
    topic,
  });
  const stream = backgroundData.streams.get(streamId);
  invariant(stream !== undefined, 'Stream with provided streamId not found.');
  showActionSheetWithOptions(
    {
      title: `#${stream.name} > ${topic}`,
      options: buttonList.map(button => callbacks._(button.title)),
      cancelButtonIndex: buttonList.length - 1,
    },
    makeButtonCallback(buttonList, {
      ...backgroundData,
      ...callbacks,
      streamId,
      topic,
    }),
  );
};
