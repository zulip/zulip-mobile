/* @flow */
import type {
  GlobalState,
  EventAction,
  EventAlertWordsAction,
  EventNewMessageAction,
  EventMessageDeleteAction,
  EventUpdateMessageAction,
  EventSubscriptionAction,
  EventStreamAction,
  EventUserAction,
  EventPresenceAction,
  EventReactionAction,
  EventTypingAction,
  EventUpdateMessageFlagsAction,
  EventMutedTopicsAction,
  EventRealmEmojiUpdateAction,
  EventRealmFiltersAction,
  EventUpdateGlobalNotificationsSettingsAction,
  EventUpdateDisplaySettingsAction,
  EventUserGroupAction,
} from '../types';
import {
  INIT_ALERT_WORDS,
  EVENT_NEW_MESSAGE,
  EVENT_PRESENCE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
  EVENT_STREAM_OCCUPY,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_SUBSCRIPTION_UPDATE,
  EVENT_SUBSCRIPTION_PEER_ADD,
  EVENT_SUBSCRIPTION_PEER_REMOVE,
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
  EVENT_MUTED_TOPICS,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTER_UPDATE,
} from '../actionConstants';

import { getUserById } from '../users/userHelpers';

const opToActionSubscription = {
  add: EVENT_SUBSCRIPTION_ADD,
  remove: EVENT_SUBSCRIPTION_REMOVE,
  update: EVENT_SUBSCRIPTION_UPDATE,
  peer_add: EVENT_SUBSCRIPTION_PEER_ADD,
  peer_remove: EVENT_SUBSCRIPTION_PEER_REMOVE,
};

const opToActionStream = {
  create: EVENT_STREAM_ADD,
  delete: EVENT_STREAM_REMOVE,
  update: EVENT_STREAM_UPDATE,
  occupy: EVENT_STREAM_OCCUPY,
};

const opToActionUser = {
  add: EVENT_USER_ADD,
  remove: EVENT_USER_REMOVE,
  update: EVENT_USER_UPDATE,
};

const opToActionUserGroup = {
  add: EVENT_USER_GROUP_ADD,
  remove: EVENT_USER_GROUP_REMOVE,
  update: EVENT_USER_GROUP_UPDATE,
  add_members: EVENT_USER_GROUP_ADD_MEMBERS,
  remove_members: EVENT_USER_GROUP_REMOVE_MEMBERS,
};

const opToActionReaction = {
  add: EVENT_REACTION_ADD,
  remove: EVENT_REACTION_REMOVE,
};

const opToActionTyping = {
  start: EVENT_TYPING_START,
  stop: EVENT_TYPING_STOP,
};

const alertWords = (state: GlobalState, event: Object): EventAlertWordsAction => ({
  type: INIT_ALERT_WORDS,
  alertWords: event.alert_words,
});

const newMessage = (state: GlobalState, event: Object): EventNewMessageAction => ({
  ...event,
  type: EVENT_NEW_MESSAGE,
  caughtUp: state.caughtUp,
  ownEmail: state.accounts[0].email,
  localMessageId: event.local_message_id,
});

const deleteMessage = (state: GlobalState, event: Object): EventMessageDeleteAction => ({
  type: EVENT_MESSAGE_DELETE,
  messageId: event.message_id,
});

const updateMessage = (state: GlobalState, event: Object): EventUpdateMessageAction => ({
  ...event,
  type: EVENT_UPDATE_MESSAGE,
});

const subscription = (state: GlobalState, event: Object): EventSubscriptionAction => ({
  ...event,
  type: opToActionSubscription[event.op],
  user: getUserById(state.users, event.user_id),
});

const realmUser = (state: GlobalState, event: Object): EventUserAction => ({
  ...event,
  type: opToActionUser[event.op],
});

const realmUserGroup = (state: GlobalState, event: Object): EventUserGroupAction => ({
  ...event,
  type: opToActionUserGroup[event.op],
});

const stream = (state: GlobalState, event: Object): EventStreamAction => ({
  ...event,
  type: opToActionStream[event.op],
});

const reaction = (state: GlobalState, event: Object): EventReactionAction => ({
  // This cast seems redundant; but without it Flow (0.67) gives a puzzling type error.
  type: (opToActionReaction[event.op]: typeof EVENT_REACTION_ADD | typeof EVENT_REACTION_REMOVE),
  emoji: event.emoji_name,
  messageId: event.message_id,
  user: event.user,
});

const presence = (state: GlobalState, event: Object): EventPresenceAction => ({
  ...event,
  type: EVENT_PRESENCE,
});

const typing = (state: GlobalState, event: Object): EventTypingAction => ({
  ...event,
  ownEmail: state.accounts[0].email,
  type: opToActionTyping[event.op],
  time: new Date().getTime(),
});

const updateMessageFlags = (state: GlobalState, event: Object): EventUpdateMessageFlagsAction => ({
  ...event,
  type: EVENT_UPDATE_MESSAGE_FLAGS,
  allMessages: state.messages,
});

const updateMutedTopics = (state: GlobalState, event: Object): EventMutedTopicsAction => ({
  ...event,
  type: EVENT_MUTED_TOPICS,
});

const realmEmojiUpdate = (state: GlobalState, event: Object): EventRealmEmojiUpdateAction => ({
  ...event,
  type: EVENT_REALM_EMOJI_UPDATE,
});

const realmFilters = (state: GlobalState, event: Object): EventRealmFiltersAction => ({
  ...event,
  type: EVENT_REALM_FILTER_UPDATE,
});

const updateGlobalNotifications = (
  state: GlobalState,
  event: Object,
): EventUpdateGlobalNotificationsSettingsAction => ({
  ...event,
  type: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
});

const updateDisplaySettings = (
  state: GlobalState,
  event: Object,
): EventUpdateDisplaySettingsAction => ({
  ...event,
  type: EVENT_UPDATE_DISPLAY_SETTINGS,
});

export default (state: GlobalState, event: Object): EventAction => {
  switch (event.type) {
    case 'alert_words':
      return alertWords(state, event);

    case 'message':
      return newMessage(state, event);

    case 'delete_message':
      return deleteMessage(state, event);

    case 'update_message':
      return updateMessage(state, event);

    case 'subscription':
      return subscription(state, event);

    case 'realm_user':
      return realmUser(state, event);

    case 'realm_bot':
      return { type: 'ignore' };

    case 'stream':
      return stream(state, event);

    case 'reaction':
      return reaction(state, event);

    case 'heartbeat':
      return { type: 'ignore' };

    case 'presence':
      return presence(state, event);

    case 'update_message_flags':
      return updateMessageFlags(state, event);

    case 'typing':
      return typing(state, event);

    case 'muted_topics':
      return updateMutedTopics(state, event);

    case 'realm_emoji':
      return realmEmojiUpdate(state, event);

    case 'realm_filters':
      return realmFilters(state, event);

    case 'update_global_notifications':
      return updateGlobalNotifications(state, event);

    case 'update_display_settings':
      return updateDisplaySettings(state, event);

    case 'user_group':
      return realmUserGroup(state, event);

    default:
      return { type: 'unknown', event };
  }
};
