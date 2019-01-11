/* @flow */
import type { NavigationNavigateAction } from 'react-navigation';

import {
  REHYDRATE,
  APP_ONLINE,
  APP_STATE,
  DEAD_QUEUE,
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
  GOT_PUSH_TOKEN,
  UNACK_PUSH_TOKEN,
  ACK_PUSH_TOKEN,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
  MARK_MESSAGES_READ,
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
  INIT_REALM_EMOJI,
  INIT_REALM_FILTER,
  SETTINGS_CHANGE,
  DRAFT_UPDATE,
  DO_NARROW,
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
  INIT_ALERT_WORDS,
  INIT_STREAMS,
  INIT_TOPICS,
  INIT_SUBSCRIPTIONS,
  EVENT_MUTED_TOPICS,
  EVENT_REALM_FILTERS,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_DISPLAY_SETTINGS,
} from './actionConstants';

import type { MessageEvent, PresenceEvent } from './api/eventTypes';

import type {
  Dimensions,
  Orientation,
  GlobalState,
  Message,
  MessagesState,
  Outbox,
  Narrow,
  Reaction,
  Identity,
  User,
  UserGroup,
  InitialData,
  RealmFilter,
  Stream,
  Subscription,
  Topic,
  PresenceState,
  RealmEmojiState,
  SettingsState,
  CaughtUpState,
  MuteState,
  AlertWordsState,
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
export type RehydrateAction = {|
  type: typeof REHYDRATE,
  payload: GlobalState | { accounts: null } | {||} | void,
  error: ?Object,
|};

export type AppOnlineAction = {|
  type: typeof APP_ONLINE,
  isOnline: boolean,
|};

export type AppStateAction = {|
  type: typeof APP_STATE,
  isActive: boolean,
|};

export type DeadQueueAction = {|
  type: typeof DEAD_QUEUE,
|};

export type InitSafeAreaInsetsAction = {|
  type: typeof INIT_SAFE_AREA_INSETS,
  safeAreaInsets: Dimensions,
|};

export type AppOrientationAction = {|
  type: typeof APP_ORIENTATION,
  orientation: Orientation,
|};

export type StartEditMessageAction = {|
  type: typeof START_EDIT_MESSAGE,
  messageId: number,
  message: string,
  topic: string,
|};

export type CancelEditMessageAction = {|
  type: typeof CANCEL_EDIT_MESSAGE,
|};

export type DebugFlagToggleAction = {|
  type: typeof DEBUG_FLAG_TOGGLE,
  key: string,
  value: string,
|};

export type NavigateAction = NavigationNavigateAction;

export type AccountSwitchAction = {|
  type: typeof ACCOUNT_SWITCH,
  index: number,
|};

export type RealmAddAction = {|
  type: typeof REALM_ADD,
  realm: string,
|};

export type AccountRemoveAction = {|
  type: typeof ACCOUNT_REMOVE,
  index: number,
|};

export type LoginSuccessAction = {|
  type: typeof LOGIN_SUCCESS,
  realm: string,
  email: string,
  apiKey: string,
|};

export type LogoutAction = {|
  type: typeof LOGOUT,
|};

export type RealmInitAction = {|
  type: typeof REALM_INIT,
  data: InitialData,
|};

/** We learned the device token from the system.  See `SessionState`. */
export type GotPushTokenAction = {|
  type: typeof GOT_PUSH_TOKEN,
  pushToken: string,
|};

/** We're about to tell the server to forget our device token. */
export type UnackPushTokenAction = {|
  type: typeof UNACK_PUSH_TOKEN,
  identity: Identity,
|};

/** The server acknowledged our device token. */
export type AckPushTokenAction = {|
  type: typeof ACK_PUSH_TOKEN,
  identity: Identity,
  pushToken: string,
|};

export type MessageFetchStartAction = {|
  type: typeof MESSAGE_FETCH_START,
  narrow: Narrow,
  numBefore: number,
  numAfter: number,
|};

export type MessageFetchCompleteAction = {|
  type: typeof MESSAGE_FETCH_COMPLETE,
  messages: Message[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
|};

export type MarkMessagesReadAction = {|
  type: typeof MARK_MESSAGES_READ,
  messageIds: number[],
|};

export type InitialFetchStartAction = {|
  type: typeof INITIAL_FETCH_START,
|};

export type InitialFetchCompleteAction = {|
  type: typeof INITIAL_FETCH_COMPLETE,
|};

export type StreamUpdateDetails = {|
  ...$Exact<Stream>,
|};

export type ServerEvent = {|
  id: number,
|};

export type EventAlertWordsAction = {|
  type: typeof INIT_ALERT_WORDS,
  alertWords: AlertWordsState,
|};

export type EventRealmFiltersAction = {|
  type: typeof EVENT_REALM_FILTERS,
  [string]: any,
|};

export type EventUpdateGlobalNotificationsSettingsAction = {|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  notification_name: | 'enable_offline_push_notiications'
    | 'enable_online_push_notiications'
    | 'enable_stream_push_notifiations',
  setting: boolean,
|};

export type EventSubscriptionAddAction = {|
  ...$Exact<ServerEvent>,
  type: typeof EVENT_SUBSCRIPTION_ADD,
  op: 'add',
  subscriptions: Subscription[],
  user: User,
|};

export type EventSubscriptionRemoveAction = {|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION_REMOVE,
  op: 'remove',
  subscriptions: Array<{
    name: string,
    stream_id: number,
  }>,
  user: User,
|};

export type EventSubscriptionUpdateAction = {|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION_UPDATE,
  op: 'update',
  email: string,
  name: string,
  property: string,
  stream_id: number,
  user: User,
  value: boolean | number | string,
|};

export type EventSubscriptionPeerAddAction = {|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION_PEER_ADD,
  op: 'peer_add',
  subscriptions: string[],
  user: User,
  user_id: number,
|};

export type EventSubscriptionPeerRemoveAction = {|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION_PEER_REMOVE,
  op: 'peer_remove',
  subscriptions: string[],
  user: User,
  user_id: number,
|};

export type EventStreamAddAction = {|
  ...ServerEvent,
  type: typeof EVENT_STREAM_ADD,
  op: 'create',
  streams: StreamUpdateDetails[],
|};

export type EventStreamRemoveAction = {|
  ...ServerEvent,
  type: typeof EVENT_STREAM_REMOVE,
  op: 'delete',
  streams: StreamUpdateDetails[],
|};

export type EventStreamUpdateAction = {|
  ...ServerEvent,
  type: typeof EVENT_STREAM_UPDATE,
  op: 'update',
  name: string,
  property: string,
  stream_id: number,
  value: string,
|};

export type EventStreamOccupyAction = {|
  ...ServerEvent,
  type: typeof EVENT_STREAM_OCCUPY,
  op: 'occupy',
  streams: StreamUpdateDetails[],
|};

export type EventNewMessageAction = {|
  ...$Diff<MessageEvent, { flags: mixed }>,
  type: typeof EVENT_NEW_MESSAGE,
  caughtUp: CaughtUpState,
  ownEmail: string,
|};

export type EventMessageDeleteAction = {|
  type: typeof EVENT_MESSAGE_DELETE,
  messageId: number,
|};
export type EventUpdateMessageAction = {|
  ...ServerEvent,
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
|};

export type EventReactionCommon = {|
  ...ServerEvent,
  ...$Exact<Reaction>,
  message_id: number,
|};

export type EventReactionAddAction = {|
  ...ServerEvent,
  ...EventReactionCommon,
  type: typeof EVENT_REACTION_ADD,
|};

export type EventReactionRemoveAction = {|
  ...ServerEvent,
  ...EventReactionCommon,
  type: typeof EVENT_REACTION_REMOVE,
|};

export type EventPresenceAction = {|
  ...PresenceEvent,
  type: typeof EVENT_PRESENCE,
|};

export type EventTypingCommon = {|
  ...ServerEvent,
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
|};

export type EventTypingStartAction = {|
  ...EventTypingCommon,
  type: typeof EVENT_TYPING_START,
  op: 'start',
|};

export type EventTypingStopAction = {|
  ...EventTypingCommon,
  type: typeof EVENT_TYPING_STOP,
  op: 'stop',
|};

export type EventUpdateMessageFlagsAction = {|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_MESSAGE_FLAGS,
  all: boolean,
  allMessages: MessagesState,
  flag: string,
  messages: number[],
  operation: 'add' | 'remove',
|};

export type EventUserAddAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_ADD,
  person: User,
|};

export type EventUserRemoveAction = {|
  type: typeof EVENT_USER_REMOVE,
  // In reality there's more -- but this will prevent accidentally using
  // the type before going and adding those other properties here properly.
|};

export type EventUserUpdateAction = {|
  type: typeof EVENT_USER_UPDATE,
  // In reality there's more -- but this will prevent accidentally using
  // the type before going and adding those other properties here properly.
|};

export type EventMutedTopicsAction = {|
  ...ServerEvent,
  type: typeof EVENT_MUTED_TOPICS,
  muted_topics: MuteState,
|};

export type EventUserGroupAddAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_ADD,
  op: 'add',
  group: UserGroup,
|};

export type EventUserGroupRemoveAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_REMOVE,
  op: 'remove',
  group_id: number,
|};

export type EventUserGroupUpdateAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_UPDATE,
  op: 'update',
  group_id: number,
  data: { description?: string, name?: string },
|};

export type EventUserGroupAddMembersAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_ADD_MEMBERS,
  op: 'add_members',
  group_id: number,
  user_ids: number[],
|};

export type EventUserGroupRemoveMembersAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_REMOVE_MEMBERS,
  op: 'remove_members',
  group_id: number,
  user_ids: number[],
|};

export type EventRealmEmojiUpdateAction = {|
  type: typeof EVENT_REALM_EMOJI_UPDATE,
  [string]: any,
|};

export type EventUpdateDisplaySettingsAction = {|
  type: typeof EVENT_UPDATE_DISPLAY_SETTINGS,
  [string]: any,
|};

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

export type EventAction =
  | EventAlertWordsAction
  | EventReactionAddAction
  | EventReactionRemoveAction
  | EventNewMessageAction
  | EventMessageDeleteAction
  | EventUpdateMessageAction
  | EventMutedTopicsAction
  | EventPresenceAction
  | EventUpdateGlobalNotificationsSettingsAction
  | EventStreamAction
  | EventSubscriptionAction
  | EventTypingAction
  | EventRealmEmojiUpdateAction
  | EventRealmFiltersAction
  | EventUpdateDisplaySettingsAction
  | EventUpdateMessageFlagsAction
  | EventUserAction
  | EventUserGroupAction
  | {| type: 'ignore' |}
  | {| type: 'unknown', event: {} |};

export type InitRealmEmojiAction = {|
  type: typeof INIT_REALM_EMOJI,
  emojis: RealmEmojiState,
|};

export type InitRealmFilterAction = {|
  type: typeof INIT_REALM_FILTER,
  filters: RealmFilter[],
|};

export type SettingsChangeAction = {|
  type: typeof SETTINGS_CHANGE,
  update: $Shape<SettingsState>,
|};

export type DraftUpdateAction = {|
  type: typeof DRAFT_UPDATE,
  narrow: Narrow,
  content: string,
|};

export type DoNarrowAction = {|
  type: typeof DO_NARROW,
  narrow: Narrow,
|};

export type PresenceResponseAction = {|
  type: typeof PRESENCE_RESPONSE,
  presence: PresenceState,
  serverTimestamp: number,
|};

export type MessageSendStartAction = {|
  type: typeof MESSAGE_SEND_START,
  outbox: Outbox,
|};

export type MessageSendCompleteAction = {|
  type: typeof MESSAGE_SEND_COMPLETE,
  local_message_id: number,
|};

export type DeleteOutboxMessageAction = {|
  type: typeof DELETE_OUTBOX_MESSAGE,
  local_message_id: number,
|};

export type ToggleOutboxSendingAction = {|
  type: typeof TOGGLE_OUTBOX_SENDING,
  sending: boolean,
|};

export type ClearTypingAction = {|
  type: typeof CLEAR_TYPING,
  outdatedNotifications: string[],
|};

export type InitStreamsAction = {|
  type: typeof INIT_STREAMS,
  streams: Stream[],
|};

export type InitTopicsAction = {|
  type: typeof INIT_TOPICS,
  topics: Topic[],
  streamId: number,
|};

export type InitSubscriptionsAction = {|
  type: typeof INIT_SUBSCRIPTIONS,
  subscriptions: Subscription[],
|};

//
// The `Action` union type.
//

type AccountAction =
  | AccountSwitchAction
  | RealmAddAction
  | AccountRemoveAction
  | LoginSuccessAction
  | LogoutAction;

type DraftsAction = DraftUpdateAction;

type LoadingAction = DeadQueueAction | InitialFetchStartAction | InitialFetchCompleteAction;

type MessageAction = MarkMessagesReadAction | MessageFetchStartAction | MessageFetchCompleteAction;

type OutboxAction = MessageSendStartAction | MessageSendCompleteAction | DeleteOutboxMessageAction;

type PresenceAction = PresenceResponseAction;

type RealmAction =
  | RealmInitAction
  | UnackPushTokenAction
  | AckPushTokenAction
  | InitRealmEmojiAction
  | InitRealmFilterAction;

type SessionAction =
  | RehydrateAction
  | AppStateAction
  | AppOnlineAction
  | InitSafeAreaInsetsAction
  | AppOrientationAction
  | DoNarrowAction
  | GotPushTokenAction
  | StartEditMessageAction
  | CancelEditMessageAction
  | DebugFlagToggleAction
  | ToggleOutboxSendingAction;

type SettingsAction = SettingsChangeAction;

type StreamAction = InitStreamsAction;

type SubscriptionsAction = InitSubscriptionsAction;

type TopicsAction = InitTopicsAction;

type TypingAction = ClearTypingAction;

/** Covers all actions we ever `dispatch`. */
// The grouping here is completely arbitrary; don't worry about it.
export type Action =
  | EventAction
  | AccountAction
  | DraftsAction
  | LoadingAction
  | MessageAction
  | OutboxAction
  | PresenceAction
  | RealmAction
  | SessionAction
  | SettingsAction
  | StreamAction
  | SubscriptionsAction
  | TopicsAction
  | TypingAction;
