/* @flow */
import type { NavigationNavigateAction } from 'react-navigation';

import {
  REHYDRATE,
  APP_ONLINE,
  APP_STATE,
  APP_REFRESH,
  INIT_SAFE_AREA_INSETS,
  APP_ORIENTATION,
  START_EDIT_MESSAGE,
  CANCEL_EDIT_MESSAGE,
  DEBUG_FLAG_TOGGLE,
  ACCOUNT_SWITCH,
  REALM_ADD,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  LOGOUT,
  REALM_INIT,
  DELETE_TOKEN_PUSH,
  SAVE_TOKEN_PUSH,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
  MARK_MESSAGES_READ,
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
  INIT_REALM_EMOJI,
  INIT_REALM_FILTER,
  SETTINGS_CHANGE,
  DRAFT_UPDATE,
  FETCH_STATE_RESET,
  PRESENCE_RESPONSE,
  MESSAGE_SEND_START,
  MESSAGE_SEND_COMPLETE,
  DELETE_OUTBOX_MESSAGE,
  TOGGLE_OUTBOX_SENDING,
  EVENT_MESSAGE_DELETE,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
  EVENT_STREAM_OCCUPY,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_SUBSCRIPTION_UPDATE,
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  EVENT_NEW_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_PRESENCE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_USER_ADD,
  EVENT_SUBSCRIPTION_PEER_ADD,
  EVENT_SUBSCRIPTION_PEER_REMOVE,
  CLEAR_TYPING,
  INIT_STREAMS,
  INIT_TOPICS,
  INIT_SUBSCRIPTIONS,
  EVENT_MUTED_TOPICS,
} from './actionConstants';

import type {
  Dimensions,
  Orientation,
  GlobalState,
  Message,
  MessagesState,
  Outbox,
  Narrow,
  User,
  UserGroup,
  InitialData,
  RealmFilter,
  Stream,
  Subscription,
  Topic,
  PresenceState,
  Presence,
  RealmEmojiState,
  CaughtUpState,
  MuteState,
} from './types';

/**
 * Dispatched by redux-persist when the stored state is loaded.
 *
 * It can be very convenient to pass `payload` to selectors, but beware it's
 * incomplete.  At a minimum, reducers should always separately handle the
 * case where the state is empty or has `null` properties before passing the
 * object to any selector.
 *
 * @prop payload A version of the global Redux state, as persisted by the
 *     app's previous runs.  This will be empty on first startup or if the
 *     persisted store is just missing keys, and will have `null` at each
 *     key where an error was encountered in reading the persisted store.
 *     In any case it will only contain the keys we configure to be persisted.
 * @prop error
 */
export type RehydrateAction = {
  type: typeof REHYDRATE,
  payload: GlobalState | { accounts: null } | {||} | void,
  error: ?Object,
};

export type AppOnlineAction = {
  type: typeof APP_ONLINE,
  isOnline: boolean,
};

export type AppStateAction = {
  type: typeof APP_STATE,
  isActive: boolean,
};

export type AppRefreshAction = {
  type: typeof APP_REFRESH,
};

export type InitSafeAreaInsetsAction = {
  type: typeof INIT_SAFE_AREA_INSETS,
  safeAreaInsets: Dimensions,
};

export type AppOrientationAction = {
  type: typeof APP_ORIENTATION,
  orientation: Orientation,
};

export type StartEditMessageAction = {
  type: typeof START_EDIT_MESSAGE,
  messageId: number,
  message: string,
  topic: string,
};

export type CancelEditMessageAction = {
  type: typeof CANCEL_EDIT_MESSAGE,
};

export type DebugFlagToggleAction = {
  type: typeof DEBUG_FLAG_TOGGLE,
  key: string,
  value: string,
};

export type NavigateAction = NavigationNavigateAction;

export type AccountSwitchAction = {
  type: typeof ACCOUNT_SWITCH,
  index: number,
};

export type RealmAddAction = {
  type: typeof REALM_ADD,
  realm: string,
};

export type AccountRemoveAction = {
  type: typeof ACCOUNT_REMOVE,
  index: number,
};

export type LoginSuccessAction = {
  type: typeof LOGIN_SUCCESS,
  realm: string,
  email: string,
  apiKey: string,
};

export type LogoutAction = {
  type: typeof LOGOUT,
};

export type RealmInitAction = {
  type: typeof REALM_INIT,
  data: InitialData,
};

export type DeleteTokenPushAction = {
  type: typeof DELETE_TOKEN_PUSH,
};

export type SaveTokenPushAction = {
  type: typeof SAVE_TOKEN_PUSH,
  pushToken: string,
  result: string,
  msg: string,
};

export type MessageFetchStartAction = {
  type: typeof MESSAGE_FETCH_START,
  narrow: Narrow,
  numBefore: number,
  numAfter: number,
};

export type MessageFetchCompleteAction = {
  type: typeof MESSAGE_FETCH_COMPLETE,
  messages: Message[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
};

export type FetchMessagesAction = any;

export type MarkMessagesReadAction = {
  type: typeof MARK_MESSAGES_READ,
  messageIds: number[],
};

export type InitialFetchStartAction = {
  type: typeof INITIAL_FETCH_START,
};

export type InitialFetchCompleteAction = {
  type: typeof INITIAL_FETCH_COMPLETE,
};

export type StreamUpdateDetails = {
  description: string,
  history_public_to_subscribers: boolean,
  invite_only: boolean,
  is_announcement_only: boolean,
  name: string,
  stream_id: number,
};

export type ServerEvent = {
  id: number,
};

export type EventAlertWordsAction = any;
export type EventRealmFiltersAction = any;
export type EventUpdateGlobalNotificationsSettingsAction = ServerEvent & {
  type: typeof EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  notification_name: | 'enable_offline_push_notiications'
    | 'enable_online_push_notiications'
    | 'enable_stream_push_notifiations',
  setting: boolean,
};

export type EventSubscriptionAddAction = ServerEvent & {
  type: typeof EVENT_SUBSCRIPTION_ADD,
  op: 'add',
  subscriptions: Subscription[],
  user: User,
};

export type EventSubscriptionRemoveAction = ServerEvent & {
  type: typeof EVENT_SUBSCRIPTION_REMOVE,
  op: 'remove',
  subscriptions: Array<{
    name: string,
    stream_id: number,
  }>,
  user: User,
};

export type EventSubscriptionUpdateAction = ServerEvent & {
  type: typeof EVENT_SUBSCRIPTION_UPDATE,
  op: 'update',
  email: string,
  name: string,
  property: string,
  stream_id: number,
  user: User,
  value: boolean | number | string,
};

export type EventSubscriptionPeerAddAction = ServerEvent & {
  type: typeof EVENT_SUBSCRIPTION_PEER_ADD,
  op: 'peer_add',
  subscriptions: string[],
  user: User,
  user_id: number,
};

export type EventSubscriptionPeerRemoveAction = ServerEvent & {
  type: typeof EVENT_SUBSCRIPTION_PEER_REMOVE,
  op: 'peer_remove',
  subscriptions: string[],
  user: User,
  user_id: number,
};

export type EventStreamAddAction = ServerEvent & {
  type: typeof EVENT_STREAM_ADD,
  op: 'create',
  streams: StreamUpdateDetails[],
};

export type EventStreamRemoveAction = ServerEvent & {
  type: typeof EVENT_STREAM_REMOVE,
  op: 'delete',
  streams: StreamUpdateDetails[],
};

export type EventStreamUpdateAction = ServerEvent & {
  type: typeof EVENT_STREAM_UPDATE,
  op: 'update',
  name: string,
  property: string,
  stream_id: number,
  value: string,
};

export type EventStreamOccupyAction = ServerEvent & {
  type: typeof EVENT_STREAM_OCCUPY,
  op: 'occupy',
  streams: StreamUpdateDetails[],
};

export type EventNewMessageAction = ServerEvent & {
  type: typeof EVENT_NEW_MESSAGE,
  caughtUp: CaughtUpState,
  local_message_id: ?number,
  message: Message,
  ownEmail: string,
};

export type EventMessageDeleteAction = {
  type: typeof EVENT_MESSAGE_DELETE,
  messageId: number,
};
export type EventUpdateMessageAction = ServerEvent & {
  type: typeof EVENT_UPDATE_MESSAGE,
  edit_timestamp: number,
  message_id: number,
  orig_content: string,
  orig_subject?: string,
  orig_rendered_content: string,
  prev_rendered_content_version: number,
  rendered_content: string,
  subject_links: string[],
  subject: string,
  user_id: number,
};

export type EventReactionCommon = ServerEvent & {
  emoji_name: string,
  message_id: number,
  user: {
    email: string,
    full_name: string,
    user_id: number,
  },
};

export type EventReactionAddAction = ServerEvent &
  EventReactionCommon & {
    type: typeof EVENT_REACTION_ADD,
  };

export type EventReactionRemoveAction = ServerEvent &
  EventReactionCommon & {
    type: typeof EVENT_REACTION_REMOVE,
  };

export type EventPresenceAction = ServerEvent & {
  type: typeof EVENT_PRESENCE,
  email: string,
  presence: Presence,
  server_timestamp: number,
};

export type EventTypingCommon = ServerEvent & {
  ownEmail: string,
  recipients: Array<{
    user_id: number,
    email: string,
  }>,
  sender: {
    user_id: number,
    email: string,
  },
  time: number,
};

export type EventTypingStartAction = EventTypingCommon & {
  type: typeof EVENT_TYPING_START,
  op: 'start',
};

export type EventTypingStopAction = EventTypingCommon & {
  type: typeof EVENT_TYPING_STOP,
  op: 'stop',
};

export type EventUpdateMessageFlagsAction = ServerEvent & {
  type: typeof EVENT_UPDATE_MESSAGE_FLAGS,
  all: boolean,
  allMessages: MessagesState,
  flag: string,
  messages: number[],
  operation: 'add' | 'remove',
};

export type EventUserAddAction = ServerEvent & {
  type: typeof EVENT_USER_ADD,
  person: User,
};
export type EventUserRemoveAction = any;
export type EventUserUpdateAction = any;

export type EventMutedTopicsAction = ServerEvent & {
  type: typeof EVENT_MUTED_TOPICS,
  muted_topics: MuteState,
};

export type EventUserGroupAddAction = ServerEvent & {
  type: typeof EVENT_USER_GROUP_ADD,
  op: 'add',
  group: UserGroup,
};

export type EventUserGroupRemoveAction = ServerEvent & {
  type: typeof EVENT_USER_GROUP_REMOVE,
  op: 'remove',
  group_id: number,
};

export type EventUserGroupUpdateAction = ServerEvent & {
  type: typeof EVENT_USER_GROUP_UPDATE,
  op: 'update',
  group_id: number,
  data: { description?: string, name?: string },
};

export type EventUserGroupAddMembersAction = ServerEvent & {
  type: typeof EVENT_USER_GROUP_ADD_MEMBERS,
  op: 'add_members',
  group_id: number,
  user_ids: number[],
};

export type EventUserGroupRemoveMembersAction = ServerEvent & {
  type: typeof EVENT_USER_GROUP_REMOVE_MEMBERS,
  op: 'remove_members',
  group_id: number,
  user_ids: number[],
};

export type EventRealmEmojiUpdateAction = any;
export type EventRealmFilterUpdateAction = any;
export type EventUpdateDisplaySettingsAction = any;

export type EventSubscriptionAction =
  | EventSubscriptionAddAction
  | EventSubscriptionRemoveAction
  | EventSubscriptionUpdateAction
  | EventSubscriptionPeerAddAction
  | EventSubscriptionPeerRemoveAction;

export type EventStreamAction =
  | EventStreamAddAction
  | EventStreamRemoveAction
  | EventStreamUpdateAction
  | EventStreamOccupyAction;

export type EventUserAction = EventUserAddAction | EventUserRemoveAction | EventUserUpdateAction;

export type EventUserGroupAction =
  | EventUserGroupAddAction
  | EventUserGroupRemoveAction
  | EventUserGroupUpdateAction
  | EventUserGroupAddMembersAction
  | EventUserGroupRemoveMembersAction;

export type EventReactionAction = EventReactionAddAction | EventReactionRemoveAction;

export type EventTypingAction = EventTypingStartAction | EventTypingStopAction;

export type EventAction = EventSubscriptionAction | EventUserAction;

export type InitRealmEmojiAction = {
  type: typeof INIT_REALM_EMOJI,
  emojis: RealmEmojiState,
};

export type InitRealmFilterAction = {
  type: typeof INIT_REALM_FILTER,
  filters: RealmFilter[],
};

export type RealmAction =
  | AppRefreshAction
  | RealmInitAction
  | DeleteTokenPushAction
  | SaveTokenPushAction
  | LoginSuccessAction
  | LogoutAction
  | InitRealmEmojiAction
  | InitRealmFilterAction
  | EventRealmFilterUpdateAction
  | EventRealmEmojiUpdateAction;

export type AlertWordsAction = RealmInitAction | EventAlertWordsAction;

export type FlagsAction =
  | RehydrateAction
  | MessageFetchCompleteAction
  | EventNewMessageAction
  | EventUpdateMessageFlagsAction
  | MarkMessagesReadAction;

export type SettingsChangeAction = {
  type: typeof SETTINGS_CHANGE,
  key: string,
  value: any,
};

export type DraftUpdateAction = {
  type: typeof DRAFT_UPDATE,
  narrow: Narrow,
  content: string,
};

export type DraftsAction = DraftUpdateAction | LogoutAction;

export type FetchStateResetAction = {
  type: typeof FETCH_STATE_RESET,
};

export type PresenceResponseAction = {
  type: typeof PRESENCE_RESPONSE,
  presence: PresenceState,
  serverTimestamp: number,
};

export type PresenceAction = EventPresenceAction | PresenceResponseAction | RealmInitAction;

export type MessageSendStartAction = {
  type: typeof MESSAGE_SEND_START,
  outbox: Outbox,
};

export type MessageSendCompleteAction = {
  type: typeof MESSAGE_SEND_COMPLETE,
  local_message_id: number,
};

export type DeleteOutboxMessageAction = {
  type: typeof DELETE_OUTBOX_MESSAGE,
  local_message_id: number,
};

export type ToggleOutboxSendingAction = {
  type: typeof TOGGLE_OUTBOX_SENDING,
  sending: boolean,
};

export type ClearTypingAction = {
  type: typeof CLEAR_TYPING,
  outdatedNotifications: string[],
};

export type TypingAction = EventTypingAction | ClearTypingAction;

export type InitStreamsAction = {
  type: typeof INIT_STREAMS,
  streams: Stream[],
};

export type InitTopicsAction = {
  type: typeof INIT_TOPICS,
  topics: Topic[],
  streamId: number,
};

export type TopicsAction = InitTopicsAction | AccountSwitchAction;

export type InitSubscriptionsAction = {
  type: typeof INIT_SUBSCRIPTIONS,
  subscriptions: Subscription[],
};

export type AccountAction =
  | AccountSwitchAction
  | RealmAddAction
  | AccountRemoveAction
  | LoginSuccessAction
  | LogoutAction;

export type CaughtUpAction =
  | AppRefreshAction
  | LogoutAction
  | LoginSuccessAction
  | AccountSwitchAction
  | MessageFetchCompleteAction;

export type LoadingAction =
  | AppRefreshAction
  | AccountSwitchAction
  | InitialFetchStartAction
  | InitialFetchCompleteAction
  | InitStreamsAction
  | InitSubscriptionsAction;

export type MessageAction =
  | MessageFetchCompleteAction
  | EventReactionAddAction
  | EventReactionRemoveAction
  | EventNewMessageAction
  | EventMessageDeleteAction
  | EventUpdateMessageAction;

export type MuteAction =
  | AppRefreshAction
  | AccountSwitchAction
  | RealmInitAction
  | EventMutedTopicsAction;

export type NavAction =
  | RehydrateAction
  | AccountSwitchAction
  | LoginSuccessAction
  | InitialFetchCompleteAction
  | LogoutAction;

export type OutboxAction =
  | MessageSendStartAction
  | MessageSendCompleteAction
  | DeleteOutboxMessageAction;

export type SessionAction =
  | RehydrateAction
  | AppStateAction
  | AppOnlineAction
  | AppRefreshAction
  | InitSafeAreaInsetsAction
  | AppOrientationAction
  | StartEditMessageAction
  | CancelEditMessageAction
  | DebugFlagToggleAction
  | RealmInitAction
  | AccountSwitchAction
  | LoginSuccessAction
  | ToggleOutboxSendingAction
  | InitialFetchCompleteAction;

export type SettingsAction =
  | RealmInitAction
  | SettingsChangeAction
  | EventUpdateGlobalNotificationsSettingsAction;

export type StreamAction =
  | InitStreamsAction
  | EventStreamRemoveAction
  | EventStreamUpdateAction
  | AccountSwitchAction;

export type SubscriptionsAction =
  | InitSubscriptionsAction
  | RealmInitAction
  | EventSubscriptionAddAction
  | EventSubscriptionRemoveAction
  | EventSubscriptionUpdateAction;

export type UnreadAction =
  | RealmInitAction
  | EventNewMessageAction
  | MarkMessagesReadAction
  | EventMessageDeleteAction
  | EventUpdateMessageFlagsAction;

export type UsersAction = RealmInitAction | EventUserAddAction;

export type UserGroupsAction =
  | RealmInitAction
  | AccountSwitchAction
  | LoginSuccessAction
  | LogoutAction;

export type Action =
  | AccountAction
  | CaughtUpAction
  | LoadingAction
  | MessageAction
  | MuteAction
  | NavAction
  | OutboxAction
  | SessionAction
  | SettingsAction
  | StreamAction
  | SubscriptionsAction
  | UnreadAction
  | UsersAction;
