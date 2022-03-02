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
  UserId,
  User,
  UserOrBot,
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
import { pmUiRecipientsFromKeyRecipients } from '../utils/recipient';
import type { PmKeyRecipients } from '../utils/recipient';
import { isTopicMuted } from '../mute/muteModel';
import * as api from '../api';
import { showToast } from '../utils/info';
import { doNarrow, deleteOutboxMessage, navigateToEmojiPicker, navigateToStream } from '../actions';
import {
  navigateToMessageReactionScreen,
  navigateToPmConversationDetails,
} from '../nav/navActions';
import { deleteMessagesForTopic } from '../topics/topicActions';
import * as logging from '../utils/logging';
import { getUnreadCountForTopic } from '../unread/unreadModel';
import getIsNotificationEnabled from '../streams/getIsNotificationEnabled';

// TODO really this belongs in a libdef.
export type ShowActionSheetWithOptions = (
  { options: string[], cancelButtonIndex: number, ... },
  (number) => void,
) => void;

type StreamArgs = {
  auth: Auth,
  streamId: number,
  subscriptions: Map<number, Subscription>,
  streams: Map<number, Stream>,
  dispatch: Dispatch,
  _: GetText,
  ...
};

type TopicArgs = {
  auth: Auth,
  streamId: number,
  topic: string,
  subscriptions: Map<number, Subscription>,
  streams: Map<number, Stream>,
  dispatch: Dispatch,
  _: GetText,
  ...
};

type PmArgs = {
  pmKeyRecipients: PmKeyRecipients,
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

type Button<-Args: { ... }> = {|
  +action: Args => void | Promise<void>,

  /** The label for the button. */
  // This UI string should be represented in messages_en.json.
  +title: string,

  /** The title of the alert-box that will be displayed if the
   * callback throws. */
  // Required even when the callback can't throw (e.g., "Cancel"),
  // since we can't otherwise ensure that everything that _can_ throw
  // has one.
  //
  // This UI string should be represented in messages_en.json.
  +errorMessage: string,
|};

//
//
// The options for the action sheets.
//

const reply = {
  title: 'Reply',
  errorMessage: 'Failed to reply',
  action: ({ message, dispatch, ownUser }) => {
    dispatch(doNarrow(getNarrowForReply(message, ownUser.user_id), message.id));
  },
};

const copyToClipboard = {
  title: 'Copy to clipboard',
  errorMessage: 'Failed to copy message to clipboard',
  action: async ({ _, auth, message }) => {
    const rawMessage = message.isOutbox
      ? message.markdownContent
      : (await api.getRawMessageContent(auth, message.id)).raw_content;
    Clipboard.setString(rawMessage);
    showToast(_('Message copied'));
  },
};

const editMessage = {
  title: 'Edit message',
  errorMessage: 'Failed to edit message',
  action: async ({ message, startEditMessage, auth }) => {
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
  },
};

const deleteMessage = {
  title: 'Delete message',
  errorMessage: 'Failed to delete message',
  action: async ({ auth, message, dispatch }) => {
    if (message.isOutbox) {
      dispatch(deleteOutboxMessage(message.timestamp));
    } else {
      await api.deleteMessage(auth, message.id);
    }
  },
};

const markTopicAsRead = {
  title: 'Mark topic as read',
  errorMessage: 'Failed to mark topic as read',
  action: async ({ auth, streamId, topic }) => {
    await api.markTopicAsRead(auth, streamId, topic);
  },
};

const unmuteTopic = {
  title: 'Unmute topic',
  errorMessage: 'Failed to unmute topic',
  action: async ({ auth, streamId, topic, streams }) => {
    const stream = streams.get(streamId);
    invariant(stream !== undefined, 'Stream with provided streamId must exist.');
    // This still uses a stream name (#3918) because the API method does; see there.
    await api.setTopicMute(auth, stream.name, topic, false);
  },
};

const muteTopic = {
  title: 'Mute topic',
  errorMessage: 'Failed to mute topic',
  action: async ({ auth, streamId, topic, streams }) => {
    const stream = streams.get(streamId);
    invariant(stream !== undefined, 'Stream with provided streamId must exist.');
    // This still uses a stream name (#3918) because the API method does; see there.
    await api.setTopicMute(auth, stream.name, topic, true);
  },
};

const deleteTopic = {
  title: 'Delete topic',
  errorMessage: 'Failed to delete topic',
  action: async ({ streamId, topic, dispatch, _ }) => {
    const confirmed = await new Promise((resolve, reject) => {
      Alert.alert(
        _('Are you sure you want to delete the topic “{topic}”?', { topic }),
        _('This will also delete all messages in the topic.'),
        [
          { text: _('Delete topic'), onPress: () => resolve(true), style: 'destructive' },
          { text: _('Cancel'), onPress: () => resolve(false), style: 'cancel' },
        ],
        { cancelable: true },
      );
    });
    if (confirmed) {
      await dispatch(deleteMessagesForTopic(streamId, topic));
    }
  },
};

const unmuteStream = {
  title: 'Unmute stream',
  errorMessage: 'Failed to unmute stream',
  action: async ({ auth, streamId }) => {
    await api.setSubscriptionProperty(auth, streamId, 'is_muted', false);
  },
};

const muteStream = {
  title: 'Mute stream',
  errorMessage: 'Failed to mute stream',
  action: async ({ auth, streamId }) => {
    await api.setSubscriptionProperty(auth, streamId, 'is_muted', true);
  },
};

const showStreamSettings = {
  title: 'Stream settings',
  errorMessage: 'Failed to show stream settings',
  action: ({ streamId }) => {
    NavigationService.dispatch(navigateToStream(streamId));
  },
};

const subscribe = {
  title: 'Subscribe',
  errorMessage: 'Failed to subscribe',
  action: async ({ auth, streamId, streams }) => {
    const stream = streams.get(streamId);
    invariant(stream !== undefined, 'Stream with provided streamId not found.');
    // This still uses a stream name (#3918) because the API method does; see there.
    await api.subscriptionAdd(auth, [{ name: stream.name }]);
  },
};

const unsubscribe = {
  title: 'Unsubscribe',
  errorMessage: 'Failed to unsubscribe',
  action: async ({ auth, streamId, subscriptions }) => {
    const sub = subscriptions.get(streamId);
    invariant(sub !== undefined, 'Subscription with provided streamId not found.');
    // This still uses a stream name (#3918) because the API method does; see there.
    await api.subscriptionRemove(auth, [sub.name]);
  },
};

const pinToTop = {
  title: 'Pin to top',
  errorMessage: 'Failed to pin to top',
  action: async ({ auth, streamId }) => {
    await api.setSubscriptionProperty(auth, streamId, 'pin_to_top', true);
  },
};

const unpinFromTop = {
  title: 'Unpin from top',
  errorMessage: 'Failed to unpin from top',
  action: async ({ auth, streamId }) => {
    await api.setSubscriptionProperty(auth, streamId, 'pin_to_top', false);
  },
};

const enableNotifications = {
  title: 'Enable notifications',
  errorMessage: 'Failed to enable notifications',
  action: async ({ auth, streamId }) => {
    await api.setSubscriptionProperty(auth, streamId, 'push_notifications', true);
  },
};

const disableNotifications = {
  title: 'Disable notifications',
  errorMessage: 'Failed to disable notifications',
  action: async ({ auth, streamId }) => {
    await api.setSubscriptionProperty(auth, streamId, 'push_notifications', false);
  },
};

const seePmConversationDetails = {
  title: 'See details',
  errorMessage: 'Failed to show details',
  action: async ({ pmKeyRecipients }) => {
    NavigationService.dispatch(navigateToPmConversationDetails(pmKeyRecipients));
  },
};

const starMessage = {
  title: 'Star message',
  errorMessage: 'Failed to star message',
  action: async ({ auth, message }) => {
    await api.toggleMessageStarred(auth, [message.id], true);
  },
};

const unstarMessage = {
  title: 'Unstar message',
  errorMessage: 'Failed to unstar message',
  action: async ({ auth, message }) => {
    await api.toggleMessageStarred(auth, [message.id], false);
  },
};

const shareMessage = {
  title: 'Share',
  errorMessage: 'Failed to share message',
  action: async ({ message }) => {
    await Share.share({
      message: message.content.replace(/<(?:.|\n)*?>/gm, ''),
    });
  },
};

const addReaction = {
  title: 'Add a reaction',
  errorMessage: 'Failed to add reaction',
  action: ({ message }) => {
    NavigationService.dispatch(navigateToEmojiPicker(message.id));
  },
};

const showReactions = {
  title: 'See who reacted',
  errorMessage: 'Failed to show reactions',
  action: ({ message }) => {
    NavigationService.dispatch(navigateToMessageReactionScreen(message.id));
  },
};

const cancel: Button<{ ... }> = {
  title: 'Cancel',
  errorMessage: 'Failed to hide menu',
  action: () => {},
};

//
//
// Assembling the list of options for an action sheet.
//
// These are separate from their callers mainly for the sake of unit tests.
//

export const constructStreamActionButtons = (args: {|
  backgroundData: $ReadOnly<{
    subscriptions: Map<number, Subscription>,
    userSettingStreamNotification: boolean,
    ...
  }>,
  streamId: number,
|}): Button<StreamArgs>[] => {
  const { backgroundData, streamId } = args;
  const { subscriptions, userSettingStreamNotification } = backgroundData;

  const buttons = [];
  const sub = subscriptions.get(streamId);
  if (sub) {
    if (!sub.in_home_view) {
      buttons.push(unmuteStream);
    } else {
      buttons.push(muteStream);
    }
    if (sub.pin_to_top) {
      buttons.push(unpinFromTop);
    } else {
      buttons.push(pinToTop);
    }
    const isNotificationEnabled = getIsNotificationEnabled(sub, userSettingStreamNotification);
    if (isNotificationEnabled) {
      buttons.push(disableNotifications);
    } else {
      buttons.push(enableNotifications);
    }
    buttons.push(unsubscribe);
  } else {
    buttons.push(subscribe);
  }
  buttons.push(showStreamSettings);
  buttons.push(cancel);
  return buttons;
};

export const constructTopicActionButtons = (args: {|
  backgroundData: $ReadOnly<{
    mute: MuteState,
    ownUser: User,
    subscriptions: Map<number, Subscription>,
    unread: UnreadState,
    ...
  }>,
  streamId: number,
  topic: string,
|}): Button<TopicArgs>[] => {
  const { backgroundData, streamId, topic } = args;
  const { mute, ownUser, subscriptions, unread } = backgroundData;

  const buttons = [];
  if (ownUser.is_admin) {
    buttons.push(deleteTopic);
  }
  const unreadCount = getUnreadCountForTopic(unread, streamId, topic);
  if (unreadCount > 0) {
    buttons.push(markTopicAsRead);
  }
  if (isTopicMuted(streamId, topic, mute)) {
    buttons.push(unmuteTopic);
  } else {
    buttons.push(muteTopic);
  }
  const sub = subscriptions.get(streamId);
  if (sub && !sub.in_home_view) {
    buttons.push(unmuteStream);
  } else {
    buttons.push(muteStream);
  }
  buttons.push(showStreamSettings);
  buttons.push(cancel);
  return buttons;
};

export const constructPmConversationActionButtons = (args: {|
  backgroundData: $ReadOnly<{ ownUser: User, ... }>,
  pmKeyRecipients: PmKeyRecipients,
|}): Button<PmArgs>[] => {
  const buttons = [];

  // TODO(#4655): If 1:1 PM, give a mute/unmute-user button, with a confirmation
  //   dialog saying that it also affects the muted users' stream messages,
  //   and linking to https://zulip.com/help/mute-a-user

  buttons.push(seePmConversationDetails);
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

export const constructMessageActionButtons = (args: {|
  backgroundData: $ReadOnly<{ ownUser: User, flags: FlagsState, ... }>,
  message: Message,
  narrow: Narrow,
|}): Button<MessageArgs>[] => {
  const { backgroundData, message, narrow } = args;
  const { ownUser, flags } = backgroundData;

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
    // TODO(#2792): Don't show if message isn't editable.
    message.sender_id === ownUser.user_id
    // Our "edit message" UI only works in certain kinds of narrows.
    && (isStreamOrTopicNarrow(narrow) || isPmNarrow(narrow))
  ) {
    buttons.push(editMessage);
  }
  if (message.sender_id === ownUser.user_id && messageNotDeleted(message)) {
    // TODO(#2793): Don't show if message isn't deletable.
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

export const constructNonHeaderActionButtons = (args: {|
  backgroundData: $ReadOnly<{ ownUser: User, flags: FlagsState, ... }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): Button<MessageArgs>[] => {
  const { backgroundData, message, narrow } = args;
  if (message.isOutbox) {
    return constructOutboxActionButtons();
  } else {
    return constructMessageActionButtons({ backgroundData, message, narrow });
  }
};

//
//
// Actually showing an action sheet.
//

function makeButtonCallback<Args: { _: GetText, ... }>(buttonList: Button<Args>[], args: Args) {
  return buttonIndex => {
    (async () => {
      const pressedButton: Button<Args> = buttonList[buttonIndex];
      try {
        await pressedButton.action(args);
      } catch (err) {
        Alert.alert(args._(pressedButton.errorMessage), err.message);
      }
    })();
  };
}

export const showMessageActionSheet = (args: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    startEditMessage: (editMessage: EditMessage) => void,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{ auth: Auth, ownUser: User, flags: FlagsState, ... }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): void => {
  const { showActionSheetWithOptions, callbacks, backgroundData, message, narrow } = args;
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

export const showTopicActionSheet = (args: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    mute: MuteState,
    streams: Map<number, Stream>,
    subscriptions: Map<number, Subscription>,
    unread: UnreadState,
    ownUser: User,
    ...
  }>,
  streamId: number,
  topic: string,
|}): void => {
  const { showActionSheetWithOptions, callbacks, backgroundData, topic, streamId } = args;
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

export const showStreamActionSheet = (args: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    streams: Map<number, Stream>,
    subscriptions: Map<number, Subscription>,
    userSettingStreamNotification: boolean,
    ...
  }>,
  streamId: number,
|}): void => {
  const { showActionSheetWithOptions, callbacks, backgroundData, streamId } = args;
  const buttonList = constructStreamActionButtons({
    backgroundData,
    streamId,
  });
  const stream = backgroundData.streams.get(streamId);
  invariant(stream !== undefined, 'Stream with provided streamId not found.');
  showActionSheetWithOptions(
    {
      title: `#${stream.name}`,
      options: buttonList.map(button => callbacks._(button.title)),
      cancelButtonIndex: buttonList.length - 1,
    },
    makeButtonCallback(buttonList, {
      ...backgroundData,
      ...callbacks,
      streamId,
    }),
  );
};

export const showPmConversationActionSheet = (args: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    _: GetText,
  |},
  backgroundData: $ReadOnly<{ ownUser: User, allUsersById: Map<UserId, UserOrBot>, ... }>,
  pmKeyRecipients: PmKeyRecipients,
|}): void => {
  const { showActionSheetWithOptions, callbacks, backgroundData, pmKeyRecipients } = args;
  const buttonList = constructPmConversationActionButtons({ backgroundData, pmKeyRecipients });

  showActionSheetWithOptions(
    {
      // TODO(ios-14.5): Check for Intl.ListFormat support in all environments
      // TODO(i18n): Localize this list (will be easiest when we don't have
      //   to polyfill Intl.ListFormat); see https://formatjs.io/docs/react-intl/api/#formatlist
      title: pmUiRecipientsFromKeyRecipients(pmKeyRecipients, backgroundData.ownUser.user_id)
        .map(userId => {
          const user = backgroundData.allUsersById.get(userId);
          invariant(user, 'allUsersById incomplete; could not show PM action sheet');
          return user.full_name;
        })
        .sort()
        .join(', '),
      titleTextStyle: {
        // We hack with this Android-only option to keep extra-long lists of
        // recipients from sabotaging the UI. Better would be to control the
        // Text's `numberOfLines` prop, but the library doesn't offer that.
        // See screenshots at
        //   https://github.com/zulip/zulip-mobile/issues/5171#issuecomment-997089710.
        //
        // On iOS, the native action sheet solves this problem for us, and
        // we're using that as of 2021-12.
        maxHeight: 160,
      },
      options: buttonList.map(button => callbacks._(button.title)),
      cancelButtonIndex: buttonList.length - 1,
    },
    makeButtonCallback(buttonList, { ...backgroundData, ...callbacks, pmKeyRecipients }),
  );
};
