/* @flow strict-local */
import { Share, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import invariant from 'invariant';
import * as resolved_topic from '@zulip/shared/lib/resolved_topic';

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
  LocalizableText,
} from '../types';
import { UserTopicVisibilityPolicy } from '../api/modelTypes';
import type { UnreadState } from '../unread/unreadModelTypes';
import {
  apiNarrowOfNarrow,
  getNarrowForReply,
  isPmNarrow,
  isStreamOrTopicNarrow,
  isTopicNarrow,
} from '../utils/narrow';
import { pmUiRecipientsFromKeyRecipients } from '../utils/recipient';
import type { PmKeyRecipients } from '../utils/recipient';
import { getTopicVisibilityPolicy } from '../mute/muteModel';
import * as api from '../api';
import { showConfirmationDialog, showErrorAlert, showToast } from '../utils/info';
import { doNarrow, deleteOutboxMessage, fetchSomeMessageIdForConversation } from '../actions';
import { deleteMessagesForTopic } from '../topics/topicActions';
import * as logging from '../utils/logging';
import { getUnreadCountForTopic } from '../unread/unreadModel';
import getIsNotificationEnabled from '../streams/getIsNotificationEnabled';
import { getStreamTopicUrl, getStreamUrl } from '../utils/internalLinks';
import { reactionTypeFromEmojiType } from '../emoji/data';
import { Role } from '../api/permissionsTypes';
import { roleIsAtLeast } from '../permissionSelectors';
import { kNotificationBotEmail } from '../api/constants';
import type { AppNavigationMethods } from '../nav/AppNavigator';
import { type ImperativeHandle as ComposeBoxImperativeHandle } from '../compose/ComposeBox';

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
  navigation: AppNavigationMethods,
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
  navigation: AppNavigationMethods,
  _: GetText,
  ...
};

type PmArgs = {
  pmKeyRecipients: PmKeyRecipients,
  navigation: AppNavigationMethods,
  _: GetText,
  ...
};

type MessageArgs = {
  auth: Auth,
  ownUser: User,
  narrow: Narrow,
  message: Message | Outbox,
  allUsersById: Map<UserId, UserOrBot>,
  streams: Map<number, Stream>,
  zulipFeatureLevel: number,
  dispatch: Dispatch,
  startEditMessage: (editMessage: EditMessage) => void,
  setDoNotMarkMessagesAsRead: boolean => void,
  composeBoxImperativeHandle: ComposeBoxImperativeHandle | null,
  navigation: AppNavigationMethods,
  _: GetText,
  ...
};

type Button<-Args: { ... }> = {|
  +action: Args => void | Promise<void>,

  /** The label for the button. */
  // This UI string should be represented in messages_en.json.
  +title: LocalizableText,

  /** The title of the alert-box that will be displayed if the
   * callback throws. */
  // Required even when the callback can't throw (e.g., "Cancel"),
  // since we can't otherwise ensure that everything that _can_ throw
  // has one.
  //
  // This UI string should be represented in messages_en.json.
  +errorMessage: LocalizableText,
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

const quoteAndReply = {
  title: 'Quote and reply',
  errorMessage: 'Quote-and-reply failed',
  action: async ({ message, composeBoxImperativeHandle }) => {
    if (!composeBoxImperativeHandle) {
      logging.error("quoteAndReply button pressed when it shouldn't have appeared in the UI");
      return;
    }
    return composeBoxImperativeHandle.doQuoteAndReply(message);
  },
};

const copyToClipboard = {
  title: 'Copy to clipboard',
  errorMessage: 'Failed to copy message to clipboard',
  action: async ({ _, auth, message, zulipFeatureLevel }) => {
    const rawMessage =
      message.isOutbox === true
        ? message.markdownContent
        : await api.getRawMessageContent(auth, { message_id: message.id }, zulipFeatureLevel);
    Clipboard.setString(rawMessage);
    showToast(_('Message copied'));
  },
};

const editMessage = {
  title: 'Edit message',
  errorMessage: 'Failed to edit message',
  action: async ({ message, startEditMessage, auth, zulipFeatureLevel }) => {
    if (message.isOutbox === true) {
      logging.warn('Attempted "Edit message" for outbox message');
      return;
    }

    const rawContent = await api.getRawMessageContent(
      auth,
      { message_id: message.id },
      zulipFeatureLevel,
    );
    startEditMessage({
      id: message.id,
      content: rawContent,
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

const markTopicAsRead = {
  title: 'Mark topic as read',
  errorMessage: 'Failed to mark topic as read',
  action: async ({ auth, streamId, topic }) => {
    await api.markTopicAsRead(auth, streamId, topic);
  },
};

const markAsUnreadFromMessage = {
  title: 'Mark as unread from here',
  errorMessage: 'Failed to mark as unread',
  action: async ({
    auth,
    zulipFeatureLevel,
    setDoNotMarkMessagesAsRead,
    narrow,
    message,
    _,
    allUsersById,
    streams,
  }) => {
    setDoNotMarkMessagesAsRead(true);

    // TODO(server-6.0): Simplify this away.  (This is for api.updateMessageFlagsForNarrow.)
    invariant(zulipFeatureLevel >= 155, 'markAsUnreadFromMessage should be called only at FL 155');

    const apiNarrow = apiNarrowOfNarrow(narrow, allUsersById, streams);
    // Ideally we might add another element to the API narrow like:
    //   { negated: true, operator: 'is', operand: 'unread' },
    // That way we'd skip acting on already-unread messages.
    //
    // Unfortunately that *also* skips any messages we lack a UserMessage
    // record for -- which means stream messages where we weren't subscribed
    // when the message was sent (and haven't subsequently created such a
    // record, e.g. by starring the message.)

    let response_count = 0;
    let updated_count = 0;
    const args = {
      anchor: message.id,
      include_anchor: true,
      num_before: 0,
      num_after: 5000,
      op: 'remove',
      flag: 'read',
      narrow: apiNarrow,
    };
    while (true) {
      const result = await api.updateMessageFlagsForNarrow(auth, args);
      response_count++;
      updated_count += result.updated_count;

      if (result.found_newest) {
        if (response_count > 1) {
          // We previously showed a "working on it…" toast, so say we're done.
          showToast(_('Marked {numMessages} messages as unread', { numMessages: updated_count }));
        }
        return;
      }

      if (result.last_processed_id === null) {
        // No messages were in the range of the request.
        // This should be impossible given that found_newest was false
        // (and that our num_after was positive.)
        logging.error('mark-unread: request failed to make progress', result);
        throw new Error(_('The server sent a malformed response.'));
      }
      args.anchor = result.last_processed_id;
      args.include_anchor = false;

      // The task is taking a while, so tell the user we're working on it.
      // No need to say how many messages, as the UnreadNotice banner should
      // follow along.
      //
      // TODO: Ideally we'd have a progress widget here that showed up based
      //   on actual time elapsed -- so it could appear before the first
      //   batch returns, if that takes a while -- and that then stuck
      //   around continuously until the task ends.  But we don't have an
      //   off-the-shelf way to wire up such a thing, and marking a giant
      //   number of messages unread isn't a common enough flow to be worth
      //   substantial effort on UI polish.  So for now, we use toasts, even
      //   though they may feel a bit janky.
      showToast(_('Marking messages as unread…'));
    }
  },
};

const unmuteTopicInMutedStream = {
  title: 'Unmute topic',
  errorMessage: 'Failed to unmute topic',
  action: async ({ auth, streamId, topic, streams, zulipFeatureLevel }) => {
    invariant(zulipFeatureLevel >= 170, 'Should only attempt to unmute in muted stream on FL 170+');
    await api.updateUserTopic(auth, streamId, topic, UserTopicVisibilityPolicy.Unmuted);
  },
};

const unmuteTopic = {
  title: 'Unmute topic',
  errorMessage: 'Failed to unmute topic',
  action: async ({ auth, streamId, topic, streams, zulipFeatureLevel }) => {
    if (zulipFeatureLevel >= 170) {
      await api.updateUserTopic(auth, streamId, topic, UserTopicVisibilityPolicy.None);
    } else {
      // TODO(server-7.0): Cut this fallback to setTopicMute.
      const stream = streams.get(streamId);
      invariant(stream !== undefined, 'Stream with provided streamId must exist.');
      // This still uses a stream name (#3918) because the API method does; see there.
      await api.setTopicMute(auth, stream.name, topic, false);
    }
  },
};

const muteTopic = {
  title: 'Mute topic',
  errorMessage: 'Failed to mute topic',
  action: async ({ auth, streamId, topic, streams, zulipFeatureLevel }) => {
    if (zulipFeatureLevel >= 170) {
      await api.updateUserTopic(auth, streamId, topic, UserTopicVisibilityPolicy.Muted);
    } else {
      // TODO(server-7.0): Cut this fallback to setTopicMute.
      const stream = streams.get(streamId);
      invariant(stream !== undefined, 'Stream with provided streamId must exist.');
      // This still uses a stream name (#3918) because the API method does; see there.
      await api.setTopicMute(auth, stream.name, topic, true);
    }
  },
};

const followTopic = {
  title: 'Follow topic',
  errorMessage: 'Failed to follow topic',
  action: async ({ auth, streamId, topic, zulipFeatureLevel }) => {
    invariant(zulipFeatureLevel >= 219, 'Should only attempt to follow topic on FL 219+');
    await api.updateUserTopic(auth, streamId, topic, UserTopicVisibilityPolicy.Followed);
  },
};

const unfollowTopic = {
  title: 'Unfollow topic',
  errorMessage: 'Failed to unfollow topic',
  action: async ({ auth, streamId, topic, zulipFeatureLevel }) => {
    invariant(zulipFeatureLevel >= 219, 'Should only attempt to unfollow topic on FL 219+');
    await api.updateUserTopic(auth, streamId, topic, UserTopicVisibilityPolicy.None);
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
  action: ({ streamId, navigation }) => {
    navigation.push('stream-settings', { streamId });
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
  action: async ({ pmKeyRecipients, navigation }) => {
    navigation.push('pm-conversation-details', { recipients: pmKeyRecipients });
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
  action: ({ auth, message, navigation, _ }) => {
    navigation.push('emoji-picker', {
      onPressEmoji: ({ code, name, type }) => {
        api
          .emojiReactionAdd(auth, message.id, reactionTypeFromEmojiType(type, name), code, name)
          .catch(err => {
            logging.error('Error adding reaction emoji', err);
            showToast(_('Failed to add reaction'));
          });
      },
    });
  },
};

const showReactions = {
  title: 'See who reacted',
  errorMessage: 'Failed to show reactions',
  action: ({ message, navigation }) => {
    navigation.push('message-reactions', { messageId: message.id });
  },
};

const viewReadReceipts = {
  title: 'View read receipts',
  errorMessage: 'Failed to show read receipts',
  action: ({ message, navigation, _ }) => {
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

    navigation.push('read-receipts', { messageId: message.id });
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
    ownUserRole: Role,
    subscriptions: Map<number, Subscription>,
    unread: UnreadState,
    zulipFeatureLevel: number,
    ...
  }>,
  streamId: number,
  topic: string,
|}): Button<TopicArgs>[] => {
  const { backgroundData, streamId, topic } = args;
  const { mute, ownUserRole, subscriptions, unread, zulipFeatureLevel } = backgroundData;
  const sub = subscriptions.get(streamId);
  const streamMuted = !!sub && !sub.in_home_view;

  // TODO(server-7.0): Simplify this condition away.
  const supportsUnmutingTopics = zulipFeatureLevel >= 170;
  // TODO(server-8.0): Simplify this condition away.
  const supportsFollowingTopics = zulipFeatureLevel >= 219;

  const buttons = [];
  const unreadCount = getUnreadCountForTopic(unread, streamId, topic);
  if (unreadCount > 0) {
    buttons.push(markTopicAsRead);
  }
  if (sub && !streamMuted) {
    // Stream subscribed and not muted.
    switch (getTopicVisibilityPolicy(mute, streamId, topic)) {
      case UserTopicVisibilityPolicy.Muted:
        buttons.push(unmuteTopic);
        if (supportsFollowingTopics) {
          buttons.push(followTopic);
        }
        break;
      case UserTopicVisibilityPolicy.None:
      case UserTopicVisibilityPolicy.Unmuted:
        buttons.push(muteTopic);
        if (supportsFollowingTopics) {
          buttons.push(followTopic);
        }
        break;
      case UserTopicVisibilityPolicy.Followed:
        buttons.push(muteTopic);
        if (supportsFollowingTopics) {
          buttons.push(unfollowTopic);
        }
        break;
    }
  } else if (sub && streamMuted) {
    // Muted stream.
    if (supportsUnmutingTopics) {
      switch (getTopicVisibilityPolicy(mute, streamId, topic)) {
        case UserTopicVisibilityPolicy.None:
        case UserTopicVisibilityPolicy.Muted:
          buttons.push(unmuteTopicInMutedStream);
          if (supportsFollowingTopics) {
            buttons.push(followTopic);
          }
          break;
        case UserTopicVisibilityPolicy.Unmuted:
          buttons.push(muteTopic);
          if (supportsFollowingTopics) {
            buttons.push(followTopic);
          }
          break;
        case UserTopicVisibilityPolicy.Followed:
          buttons.push(muteTopic);
          if (supportsFollowingTopics) {
            buttons.push(unfollowTopic);
          }
          break;
      }
    }
  } else {
    // Not subscribed to stream at all; no muting.
  }
  if (!resolved_topic.is_resolved(topic)) {
    buttons.push(resolveTopic);
  } else {
    buttons.push(unresolveTopic);
  }
  if (roleIsAtLeast(ownUserRole, Role.Admin)) {
    buttons.push(deleteTopic);
  }
  if (sub && streamMuted) {
    buttons.push(unmuteStream);
  } else if (sub && !streamMuted) {
    buttons.push(muteStream);
  } else {
    // Not subscribed to stream at all; no muting.
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
  backgroundData: $ReadOnly<{
    ownUser: User,
    flags: FlagsState,
    enableReadReceipts: boolean,
    allUsersById: Map<UserId, UserOrBot>,
    streams: Map<number, Stream>,
    subscriptions: Map<number, Subscription>,
    zulipFeatureLevel: number,
    ...
  }>,
  message: Message | Outbox,
  narrow: Narrow,
  canStartQuoteAndReply: boolean,
|}): Button<MessageArgs>[] => {
  const { backgroundData, message, narrow, canStartQuoteAndReply } = args;
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
  if (canStartQuoteAndReply) {
    buttons.push(quoteAndReply);
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
  if (
    // When do we offer "Mark as unread from here"?  This logic parallels
    // `should_display_mark_as_unread` in web's static/js/popovers.js .
    //
    // We show it only if this particular message can be marked as unread
    // (even though in principle the feature could be useful just to mark
    // later messages as read.)  That means it isn't already unread…
    message.id in flags.read
    // … and it isn't to a stream we're not subscribed to.
    && (message.type === 'private' || backgroundData.subscriptions.get(message.stream_id))
    // Oh and if the server is too old for the feature, don't offer it.
    // TODO(server-6.0): Simplify this away.
    && backgroundData.zulipFeatureLevel >= 155
  ) {
    buttons.push(markAsUnreadFromMessage);
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
    composeBoxImperativeHandle: ComposeBoxImperativeHandle | null,
    navigation: AppNavigationMethods,
    _: GetText,
    setDoNotMarkMessagesAsRead: boolean => void,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    ownUser: User,
    flags: FlagsState,
    enableReadReceipts: boolean,
    zulipFeatureLevel: number,
    allUsersById: Map<UserId, UserOrBot>,
    streams: Map<number, Stream>,
    subscriptions: Map<number, Subscription>,
    ...
  }>,
  message: Message | Outbox,
  narrow: Narrow,
|}): void => {
  const { showActionSheetWithOptions, callbacks, backgroundData, message, narrow } = args;
  showActionSheet({
    showActionSheetWithOptions,
    options: constructMessageActionButtons({
      backgroundData,
      message,
      narrow,
      canStartQuoteAndReply: callbacks.composeBoxImperativeHandle !== null,
    }),
    args: { ...backgroundData, ...callbacks, message, narrow },
  });
};

export const showTopicActionSheet = (args: {|
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  callbacks: {|
    dispatch: Dispatch,
    navigation: AppNavigationMethods,
    _: GetText,
  |},
  backgroundData: $ReadOnly<{
    auth: Auth,
    mute: MuteState,
    streams: Map<number, Stream>,
    subscriptions: Map<number, Subscription>,
    unread: UnreadState,
    ownUser: User,
    ownUserRole: Role,
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
    navigation: AppNavigationMethods,
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
    navigation: AppNavigationMethods,
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
