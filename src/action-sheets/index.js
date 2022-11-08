/* @flow strict-local */
import { Clipboard, Share, Alert } from 'react-native';
import invariant from 'invariant';
import * as resolved_topic from '@zulip/shared/js/resolved_topic';

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
import { showConfirmationDialog, showErrorAlert, showToast } from '../utils/info';
import {
  doNarrow,
  deleteOutboxMessage,
  navigateToEmojiPicker,
  navigateToStream,
  fetchSomeMessageIdForConversation,
} from '../actions';
import {
  navigateToMessageReactionScreen,
  navigateToPmConversationDetails,
  navigateToReadReceiptsScreen,
} from '../nav/navActions';
import { deleteMessagesForTopic } from '../topics/topicActions';
import * as logging from '../utils/logging';
import { getUnreadCountForTopic } from '../unread/unreadModel';
import getIsNotificationEnabled from '../streams/getIsNotificationEnabled';
import { getStreamTopicUrl, getStreamUrl } from '../utils/internalLinks';
import { reactionTypeFromEmojiType } from '../emoji/data';
import { Role, type RoleT } from '../api/permissionsTypes';
import { roleIsAtLeast } from '../permissionSelectors';
import { kNotificationBotEmail } from '../api/constants';

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
  zulipFeatureLevel: number,
  dispatch: Dispatch,
  _: GetText,
  startEditTopic: (streamId: number, topic: string) => void,
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
    const rawMessage =
      message.isOutbox === true
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
    if (message.isOutbox === true) {
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
    if (message.isOutbox === true) {
      dispatch(deleteOutboxMessage(message.timestamp));
    } else {
      await api.deleteMessage(auth, message.id);
    }
  },
};

const editTopic = {
  title: 'Edit topic',
  errorMessage: 'Failed to edit topic',
  action: ({ streamId, topic, startEditTopic }) => {
    startEditTopic(streamId, topic);
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

const copyLinkToTopic = {
  title: 'Copy link to topic',
  errorMessage: 'Failed to copy topic link',
  action: async ({ auth, streamId, topic, streams, _ }) => {
    const topicUrl = getStreamTopicUrl(auth.realm, streamId, topic, streams);
    Clipboard.setString(topicUrl.toString());
    showToast(_('Link copied'));
  },
};

const toggleResolveTopic = async ({ auth, streamId, topic, _, streams, zulipFeatureLevel }) => {
  // TODO: It'd be nice to use a message ID we know is in the conversation,
  //   where possible, rather than do this extra fetch.  Just need to thread
  //   such a message ID through to here.  (Like web, we'll still need this
  //   for cases where we can show a topic without knowing of any message ID
  //   definitely in it, e.g. in the list of topics for a stream.)
  const messageId = await fetchSomeMessageIdForConversation(
    auth,
    streamId,
    topic,
    streams,
    zulipFeatureLevel,
  );
  if (messageId == null) {
    // The conversation is actually empty.  This can be perfectly normal,
    // because by fetching information outside the events system we're
    // exposed to a race: e.g., someone else could have resolved the topic
    // already and we just hadn't heard yet.
    //
    // This exception will be caught at makeButtonCallback and the message
    // shown to the user.
    throw new Error(
      _('No messages in topic: {streamAndTopic}', {
        streamAndTopic: `#${streams.get(streamId)?.name ?? 'unknown'} > ${topic}`,
      }),
    );
  }

  const newTopic = resolved_topic.is_resolved(topic)
    ? resolved_topic.unresolve_name(topic)
    : resolved_topic.resolve_name(topic);

  await api.updateMessage(auth, messageId, {
    propagate_mode: 'change_all',
    subject: newTopic,
    ...(zulipFeatureLevel >= 9 && {
      send_notification_to_old_thread: false,
      send_notification_to_new_thread: true,
    }),
  });
};

const resolveTopic = {
  title: 'Resolve topic',
  errorMessage: 'Failed to resolve topic',
  action: toggleResolveTopic,
};

const unresolveTopic = {
  title: 'Unresolve topic',
  errorMessage: 'Failed to unresolve topic',
  action: toggleResolveTopic,
};

const deleteTopic = {
  title: 'Delete topic',
  errorMessage: 'Failed to delete topic',
  action: async ({ streamId, topic, dispatch, _ }) => {
    const confirmed = await new Promise((resolve, reject) => {
      showConfirmationDialog({
        destructive: true,
        title: 'Delete topic',
        message: {
          text: 'Deleting a topic will immediately remove it and its messages for everyone. Other users may find this confusing, especially if they had received an email or push notification related to the deleted messages.\n\nAre you sure you want to permanently delete “{topic}”?',
          values: { topic },
        },
        onPressConfirm: () => resolve(true),
        onPressCancel: () => resolve(false),
        _,
      });
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

const copyLinkToStream = {
  title: 'Copy link to stream',
  errorMessage: 'Failed to copy stream link',
  action: async ({ auth, streamId, streams, _ }) => {
    const streamUrl = getStreamUrl(auth.realm, streamId, streams);
    Clipboard.setString(streamUrl.toString());
    showToast(_('Link copied'));
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
  action: ({ auth, message, _ }) => {
    NavigationService.dispatch(
      navigateToEmojiPicker(({ code, name, type }) => {
        api
          .emojiReactionAdd(auth, message.id, reactionTypeFromEmojiType(type, name), code, name)
          .catch(err => {
            logging.error('Error adding reaction emoji', err);
            showToast(_('Failed to add reaction'));
          });
      }),
    );
  },
};

const showReactions = {
  title: 'See who reacted',
  errorMessage: 'Failed to show reactions',
  action: ({ message }) => {
    NavigationService.dispatch(navigateToMessageReactionScreen(message.id));
  },
};

const viewReadReceipts = {
  title: 'View read receipts',
  errorMessage: 'Failed to show read receipts',
  action: ({ message, _ }) => {
    // Notification Bot messages about resolved/unresolved topics have
    // confusing read receipts. Because those messages are immediately
    // marked as read for all non-participants in the thread, it looks
    // like many people have immediately read the message. So, disable
    // showing read receipts for messages sent by Notification Bot. See
    //   https://github.com/zulip/zulip/issues/22905 .
    if (message.sender_email === kNotificationBotEmail) {
      // We might instead have handled this in the read-receipts screen by
      // showing this message there. But it's awkward code-wise to make that
      // screen sometimes skip the API call, api.getReadReceipts. And it's
      // nice to skip that API call because it lets the server add a
      // server-side check for this, if it wants, without fear of breaking
      // mobile releases that haven't adapted.
      showErrorAlert(
        _('Read receipts'),
        _('Read receipts are not available for Notification Bot messages.'),
      );
      return;
    }

    NavigationService.dispatch(navigateToReadReceiptsScreen(message.id));
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
    buttons.push(copyLinkToStream);
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
    ownUserRole: RoleT,
    subscriptions: Map<number, Subscription>,
    unread: UnreadState,
    ...
  }>,
  streamId: number,
  topic: string,
|}): Button<TopicArgs>[] => {
  const { backgroundData, streamId, topic } = args;
  const { mute, ownUserRole, subscriptions, unread } = backgroundData;

  const buttons = [];
  const unreadCount = getUnreadCountForTopic(unread, streamId, topic);
  const isAdmin = roleIsAtLeast(ownUserRole, Role.Admin);
  if (unreadCount > 0) {
    buttons.push(markTopicAsRead);
  }
  // At present, the permissions for editing the topic of a message are highly complex.
  // Until we move to a better set of policy options, we'll only display the edit topic
  // button to admins.
  // Issue: https://github.com/zulip/zulip/issues/21739
  // Relevant comment: https://github.com/zulip/zulip-mobile/issues/5365#issuecomment-1197093294
  if (isAdmin) {
    buttons.push(editTopic);
  }
  if (isTopicMuted(streamId, topic, mute)) {
    buttons.push(unmuteTopic);
  } else {
    buttons.push(muteTopic);
  }
  if (!resolved_topic.is_resolved(topic)) {
    buttons.push(resolveTopic);
  } else {
    buttons.push(unresolveTopic);
  }
  if (isAdmin) {
    buttons.push(deleteTopic);
  }
  const sub = subscriptions.get(streamId);
  if (sub && !sub.in_home_view) {
    buttons.push(unmuteStream);
  } else {
    buttons.push(muteStream);
  }
  buttons.push(copyLinkToTopic);
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

const messageNotDeleted = (message: Message | Outbox): boolean =>
  message.content !== '<p>(deleted)</p>';

export const constructMessageActionButtons = (args: {|
  backgroundData: $ReadOnly<{ ownUser: User, flags: FlagsState, enableReadReceipts: boolean, ... }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): Button<MessageArgs>[] => {
  const { backgroundData, message, narrow } = args;
  const { ownUser, flags } = backgroundData;
  const buttons = [];

  if (message.isOutbox === true) {
    buttons.push(copyToClipboard);
    buttons.push(shareMessage);
    buttons.push(deleteMessage);
    buttons.push(cancel);
    return buttons;
  }

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
  if (backgroundData.enableReadReceipts) {
    buttons.push(viewReadReceipts);
  }
  buttons.push(cancel);
  return buttons;
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
        // TODO: Log any unexpected errors.  `RequestError` is expected, as
        //   are any errors specifically thrown in the action's code.
        //   (Those should probably get their own Error subclass so we can
        //   distinguish them here.)  Anything else is a bug.
        //
        //   In fact, probably even `ApiError` (a subclass of
        //   `RequestError`) should be logged.  Those can be a bug -- e.g.,
        //   some subtle permission which we'd ideally take into account by
        //   disabling the option in the UI -- though they can also just be
        //   due to the inherent race condition of making a request while
        //   some other client may have concurrently changed things.

        Alert.alert(args._(pressedButton.errorMessage), err.message);
      }
    })();
  };
}

function showActionSheet<Args: { _: GetText, ... }>(params: {
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  options: Array<Button<Args>>,
  args: Args,
  ...
}) {
  const { showActionSheetWithOptions, options, args, ...rest } = params;
  const titles = options.map(button => args._(button.title));
  showActionSheetWithOptions(
    { ...rest, options: titles, cancelButtonIndex: titles.length - 1 },
    makeButtonCallback(options, args),
  );
}

export const showMessageActionSheet = (args: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    startEditMessage: (editMessage: EditMessage) => void,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    ownUser: User,
    flags: FlagsState,
    enableReadReceipts: boolean,
    ...
  }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): void => {
  const { showActionSheetWithOptions, callbacks, backgroundData, message, narrow } = args;
  showActionSheet({
    showActionSheetWithOptions,
    options: constructMessageActionButtons({ backgroundData, message, narrow }),
    args: { ...backgroundData, ...callbacks, message, narrow },
  });
};

export const showTopicActionSheet = (args: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    startEditTopic: (streamId: number, topic: string) => void,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    mute: MuteState,
    streams: Map<number, Stream>,
    subscriptions: Map<number, Subscription>,
    unread: UnreadState,
    ownUser: User,
    ownUserRole: RoleT,
    zulipFeatureLevel: number,
    ...
  }>,
  streamId: number,
  topic: string,
|}): void => {
  const { showActionSheetWithOptions, callbacks, backgroundData, topic, streamId } = args;
  const stream = backgroundData.streams.get(streamId);
  invariant(stream !== undefined, 'Stream with provided streamId not found.');
  showActionSheet({
    showActionSheetWithOptions,
    title: `#${stream.name} > ${topic}`,
    options: constructTopicActionButtons({ backgroundData, streamId, topic }),
    args: { ...backgroundData, ...callbacks, streamId, topic },
  });
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
  const stream = backgroundData.streams.get(streamId);
  invariant(stream !== undefined, 'Stream with provided streamId not found.');
  showActionSheet({
    showActionSheetWithOptions,
    title: `#${stream.name}`,
    options: constructStreamActionButtons({ backgroundData, streamId }),
    args: { ...backgroundData, ...callbacks, streamId },
  });
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
  showActionSheet({
    showActionSheetWithOptions,
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
    options: constructPmConversationActionButtons({ backgroundData, pmKeyRecipients }),
    args: { ...backgroundData, ...callbacks, pmKeyRecipients },
  });
};
