/* @flow strict-local */
import {
  REHYDRATE,
  APP_ONLINE,
  DEAD_QUEUE,
  APP_ORIENTATION,
  DEBUG_FLAG_TOGGLE,
  ACCOUNT_SWITCH,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  LOGOUT,
  GOT_PUSH_TOKEN,
  UNACK_PUSH_TOKEN,
  ACK_PUSH_TOKEN,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_ERROR,
  MESSAGE_FETCH_COMPLETE,
  REGISTER_START,
  REGISTER_ABORT,
  REGISTER_COMPLETE,
  SET_GLOBAL_SETTINGS,
  DRAFT_UPDATE,
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
  EVENT_USER_STATUS_UPDATE,
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
  CLEAR_TYPING,
  EVENT_ALERT_WORDS,
  INIT_TOPICS,
  EVENT_MUTED_TOPICS,
  EVENT_MUTED_USERS,
  EVENT_REALM_FILTERS,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_SUBMESSAGE,
  EVENT_SUBSCRIPTION,
  EVENT,
  DISMISS_SERVER_COMPAT_NOTICE,
} from './actionConstants';

import type {
  MessageEvent,
  MutedUsersEvent,
  PresenceEvent,
  StreamEvent,
  SubmessageEvent,
  RestartEvent,
} from './api/eventTypes';

import type {
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
  Subscription,
  Topic,
  PresenceState,
  RealmEmojiById,
  GlobalSettingsState,
  CaughtUpState,
  MuteState,
  AlertWordsState,
  UserId,
  UserStatusEvent,
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
 *     persisted state is just missing keys, and will have `null` at each
 *     key where an error was encountered in reading the persisted state.
 *     In any case it will only contain the keys we configure to be persisted.
 * @prop error
 */
type RehydrateAction = {|
  type: typeof REHYDRATE,
  payload: $ReadOnly<$ObjMap<$Rest<GlobalState, { ... }>, <V>(V) => V | null>> | void,
  error: mixed,
|};

type AppOnlineAction = {|
  type: typeof APP_ONLINE,
  isOnline: boolean | null,
|};

type DeadQueueAction = {|
  type: typeof DEAD_QUEUE,
|};

type AppOrientationAction = {|
  type: typeof APP_ORIENTATION,
  orientation: Orientation,
|};

type DebugFlagToggleAction = {|
  type: typeof DEBUG_FLAG_TOGGLE,
  key: string,
  value: boolean,
|};

type DismissServerCompatNoticeAction = {|
  type: typeof DISMISS_SERVER_COMPAT_NOTICE,
|};

export type AccountSwitchAction = {|
  type: typeof ACCOUNT_SWITCH,
  index: number,
|};

type AccountRemoveAction = {|
  type: typeof ACCOUNT_REMOVE,
  index: number,
|};

export type LoginSuccessAction = {|
  type: typeof LOGIN_SUCCESS,
  realm: URL,
  email: string,
  apiKey: string,
|};

type LogoutAction = {|
  type: typeof LOGOUT,
|};

/** We learned the device token from the system.  See `SessionState`. */
type GotPushTokenAction = {|
  type: typeof GOT_PUSH_TOKEN,
  pushToken: null | string,
|};

/** We're about to tell the server to forget our device token. */
type UnackPushTokenAction = {|
  type: typeof UNACK_PUSH_TOKEN,
  identity: Identity,
|};

/** The server acknowledged our device token. */
type AckPushTokenAction = {|
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

/**
 * Any unexpected failure in a message fetch.
 *
 * Includes request timeout errors and any errors we throw when
 * validating and reshaping the server data at the edge.
 *
 * In an ideal crunchy-shell world [1], none of these will be thrown
 * from our Redux reducers: as part of the "soft center" of the app,
 * the data should already be valid at that point. We're not yet in
 * that world, so, we take care to catch those errors and dispatch
 * this action there too. See discussion [2] for implementation notes.
 *
 * [1] https://github.com/zulip/zulip-mobile/blob/main/docs/architecture/crunchy-shell.md
 * [2] https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/.23M4156.20Message.20List.20placeholders/near/937480
 */
type MessageFetchErrorAction = {|
  type: typeof MESSAGE_FETCH_ERROR,
  narrow: Narrow,
  // Before storing this in state, be sure to replace/revive Error
  // instances so they aren't coerced into plain objects; see
  // bfe794955 for an example.
  error: Error,
|};

export type MessageFetchCompleteAction = {|
  type: typeof MESSAGE_FETCH_COMPLETE,
  messages: Message[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  foundNewest: boolean,
  foundOldest: boolean,
  ownUserId: UserId,
|};

type RegisterStartAction = {|
  type: typeof REGISTER_START,
|};

export type RegisterAbortReason = 'server' | 'network' | 'timeout' | 'unexpected';

/**
 * Notify Redux that we've given up on the initial fetch.
 *
 * Not for unrecoverable errors, like ApiErrors, which indicate that we
 * tried and failed, not that we gave up trying.
 */
type RegisterAbortAction = {|
  type: typeof REGISTER_ABORT,
  reason: RegisterAbortReason,
|};

export type RegisterCompleteAction = {|
  type: typeof REGISTER_COMPLETE,
  data: InitialData,
|};

type ServerEvent = {|
  id: number,
|};

type EventAlertWordsAction = {|
  type: typeof EVENT_ALERT_WORDS,
  alertWords: AlertWordsState,
|};

type EventRealmFiltersAction = {|
  ...ServerEvent,
  type: typeof EVENT_REALM_FILTERS,
  realm_filters: RealmFilter[],
|};

type EventUpdateGlobalNotificationsSettingsAction = {|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  notification_name:
    | 'enable_offline_push_notifications'
    | 'enable_online_push_notifications'
    | 'enable_stream_push_notifications',
  setting: boolean,
|};

type EventSubscriptionAddAction = {|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'add',
  subscriptions: Subscription[],
|};

type EventSubscriptionRemoveAction = {|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'remove',
  subscriptions: Array<{|
    name: string,
    stream_id: number,
  |}>,
|};

type EventSubscriptionUpdateAction = {|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'update',
  stream_id: number,
  property: string,
  value: boolean | number | string,

  // TODO(server-4.0): Delete these commented-out properties.
  // name: string, // exists pre-4.0, but expected to be removed soon
  // email: string, // gone in 4.0; was the user's own email, so never useful
|};

type EventSubscriptionPeerAddAction = {|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'peer_add',
  subscriptions: string[],
  user_id: UserId,
|};

type EventSubscriptionPeerRemoveAction = {|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'peer_remove',
  subscriptions: string[],
  user_id: UserId,
|};

type GenericEventAction = {|
  type: typeof EVENT,
  event: StreamEvent | RestartEvent,
|};

type EventNewMessageAction = {|
  ...$Diff<MessageEvent, {| flags: mixed |}>,
  type: typeof EVENT_NEW_MESSAGE,
  caughtUp: CaughtUpState,
  ownUserId: UserId,
|};

type EventSubmessageAction = {|
  ...SubmessageEvent,
  type: typeof EVENT_SUBMESSAGE,
|};

type EventMessageDeleteAction = {|
  type: typeof EVENT_MESSAGE_DELETE,
  messageIds: number[],
|};
type EventUpdateMessageAction = {|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_MESSAGE,
  edit_timestamp: number,
  message_id: number,
  // TODO is it really right that just one of the orig_* is optional?
  orig_content: string,

  // TODO: The doc for this field isn't yet correct; it turns out that
  // the question of whether `orig_subject` is present or not is
  // complicated; see discussion at
  // https://chat.zulip.org/#narrow/stream/206-zulip-terminal/topic/subject.20always.20present.20in.20event/near/1098954.
  //
  // We can be pretty sure of a few things, though:
  // - it will not be present if the message doesn't have a topic
  //   (i.e., if it's a private message)
  // - it's guaranteed to be present if the topic did indeed change
  // - it will never be an empty string, because the server doesn't
  //   accept the empty string for a message's topic; it requires
  //   clients to specify something like `(no topic)` if no topic is
  //   desired.
  orig_subject?: string,

  orig_rendered_content: string,
  prev_rendered_content_version: number,
  rendered_content: string,
  subject_links: string[],
  subject: string,
  user_id: UserId,
|};

type EventReactionCommon = {|
  ...ServerEvent,
  ...$Exact<Reaction>,
  message_id: number,
|};

type EventReactionAddAction = {|
  ...ServerEvent,
  ...EventReactionCommon,
  type: typeof EVENT_REACTION_ADD,
|};

type EventReactionRemoveAction = {|
  ...ServerEvent,
  ...EventReactionCommon,
  type: typeof EVENT_REACTION_REMOVE,
|};

type EventPresenceAction = {|
  ...PresenceEvent,
  type: typeof EVENT_PRESENCE,
|};

type EventTypingCommon = {|
  ...ServerEvent,
  ownUserId: UserId,
  recipients: $ReadOnlyArray<{|
    user_id: UserId,
    email: string,
  |}>,
  sender: {|
    user_id: UserId,
    email: string,
  |},
  time: number,
|};

type EventTypingStartAction = {|
  ...EventTypingCommon,
  type: typeof EVENT_TYPING_START,
  op: 'start',
|};

type EventTypingStopAction = {|
  ...EventTypingCommon,
  type: typeof EVENT_TYPING_STOP,
  op: 'stop',
|};

type EventUpdateMessageFlagsAction = {|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_MESSAGE_FLAGS,
  all: boolean,
  allMessages: MessagesState,
  flag: string,
  messages: number[],
  op: 'add' | 'remove',
|};

type EventUserAddAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_ADD,
  person: User,
|};

type EventUserRemoveAction = {|
  type: typeof EVENT_USER_REMOVE,
  // In reality there's more -- but this will prevent accidentally using
  // the type before going and adding those other properties here properly.
|};

type EventUserUpdateAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_UPDATE,
  userId: UserId,
  // Include only the fields that should be overwritten.
  person: $Shape<User>,
|};

type EventMutedTopicsAction = {|
  ...ServerEvent,
  type: typeof EVENT_MUTED_TOPICS,
  muted_topics: MuteState,
|};

type EventMutedUsersAction = {|
  ...MutedUsersEvent,
  type: typeof EVENT_MUTED_USERS,
|};

type EventUserGroupAddAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_ADD,
  op: 'add',
  group: UserGroup,
|};

type EventUserGroupRemoveAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_REMOVE,
  op: 'remove',
  group_id: number,
|};

type EventUserGroupUpdateAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_UPDATE,
  op: 'update',
  group_id: number,
  data: {| description?: string, name?: string |},
|};

type EventUserGroupAddMembersAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_ADD_MEMBERS,
  op: 'add_members',
  group_id: number,
  user_ids: UserId[],
|};

type EventUserGroupRemoveMembersAction = {|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_REMOVE_MEMBERS,
  op: 'remove_members',
  group_id: number,
  user_ids: UserId[],
|};

type EventRealmEmojiUpdateAction = {|
  ...ServerEvent,
  type: typeof EVENT_REALM_EMOJI_UPDATE,
  realm_emoji: RealmEmojiById,
|};

type EventUpdateDisplaySettingsAction = {|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_DISPLAY_SETTINGS,
  setting_name: string,
  /** In reality, this can be a variety of types. It's boolean for a
   * `setting_name` of `twenty_four_hour_time`, which is the only case we
   * currently look at. */
  setting: boolean,
|};

type EventReactionAction = EventReactionAddAction | EventReactionRemoveAction;

type EventUserStatusUpdateAction = {|
  ...UserStatusEvent,
  type: typeof EVENT_USER_STATUS_UPDATE,
|};

type EventSubscriptionAction =
  | EventSubscriptionAddAction
  | EventSubscriptionRemoveAction
  | EventSubscriptionUpdateAction
  | EventSubscriptionPeerAddAction
  | EventSubscriptionPeerRemoveAction;

type EventTypingAction = EventTypingStartAction | EventTypingStopAction;

type EventUserAction = EventUserAddAction | EventUserRemoveAction | EventUserUpdateAction;

type EventUserGroupAction =
  | EventUserGroupAddAction
  | EventUserGroupRemoveAction
  | EventUserGroupUpdateAction
  | EventUserGroupAddMembersAction
  | EventUserGroupRemoveMembersAction;

/** Covers all actions we make from server events. */
export type EventAction =
  | GenericEventAction
  // Specific actions.
  | EventAlertWordsAction
  | EventMessageDeleteAction
  | EventMutedTopicsAction
  | EventMutedUsersAction
  | EventNewMessageAction
  | EventSubmessageAction
  | EventPresenceAction
  | EventRealmEmojiUpdateAction
  | EventRealmFiltersAction
  | EventUpdateGlobalNotificationsSettingsAction
  | EventUpdateDisplaySettingsAction
  | EventUpdateMessageAction
  | EventUpdateMessageFlagsAction
  // Unions, found just above.
  | EventReactionAction
  | EventSubscriptionAction
  | EventTypingAction
  | EventUserAction
  | EventUserGroupAction
  | EventUserStatusUpdateAction;

type SetGlobalSettingsAction = {|
  type: typeof SET_GLOBAL_SETTINGS,
  update: $Shape<$Exact<GlobalSettingsState>>,
|};

type DraftUpdateAction = {|
  type: typeof DRAFT_UPDATE,
  narrow: Narrow,
  content: string,
|};

type PresenceResponseAction = {|
  type: typeof PRESENCE_RESPONSE,
  presence: PresenceState,
  serverTimestamp: number,
|};

type MessageSendStartAction = {|
  type: typeof MESSAGE_SEND_START,
  outbox: Outbox,
|};

type MessageSendCompleteAction = {|
  type: typeof MESSAGE_SEND_COMPLETE,
  local_message_id: number,
|};

type DeleteOutboxMessageAction = {|
  type: typeof DELETE_OUTBOX_MESSAGE,
  local_message_id: number,
|};

type ToggleOutboxSendingAction = {|
  type: typeof TOGGLE_OUTBOX_SENDING,
  sending: boolean,
|};

type ClearTypingAction = {|
  type: typeof CLEAR_TYPING,
  outdatedNotifications: string[],
|};

type InitTopicsAction = {|
  type: typeof INIT_TOPICS,
  topics: Topic[],
  streamId: number,
|};

/* eslint-disable spaced-comment */

////
//
// The `Action` union type, and some subtypes.
//
////

//
// First, some convenience unions without much meaning.
// (We should perhaps just inline these below.)

type AccountAction = AccountSwitchAction | AccountRemoveAction | LoginSuccessAction | LogoutAction;

type LoadingAction =
  | DeadQueueAction
  | RegisterStartAction
  | RegisterAbortAction
  | RegisterCompleteAction;

type MessageAction = MessageFetchStartAction | MessageFetchErrorAction | MessageFetchCompleteAction;

type OutboxAction = MessageSendStartAction | MessageSendCompleteAction | DeleteOutboxMessageAction;

//
// Then, the primary subtypes of `Action`.  Each of these should have some
// coherent meaning in terms of what kind of state it applies to; and they
// should have no overlap.  (Subtypes that might overlap are formed below
// as unions of these primary subtypes.)

/* eslint-disable semi-style */

/**
 * Plain actions applying to this account's state.
 *
 * That is, these should only be dispatched from a per-account context, and
 * they apply to the account the caller is acting on.  In a pre-#5006 world,
 * that means the active account.
 */
// prettier-ignore
export type PerAccountAction =
  // The grouping here is completely arbitrary; don't worry about it.
  | EventAction
  | LoadingAction
  | MessageAction
  | OutboxAction
  | RegisterCompleteAction
  | DraftUpdateAction
  | PresenceResponseAction
  | InitTopicsAction
  | ClearTypingAction
  // state.session
  | DismissServerCompatNoticeAction
  | ToggleOutboxSendingAction
  ;

/** Plain actions applying to other accounts' per-account state. */
// prettier-ignore
export type AllAccountsAction =
  // This affects all the per-account states as well as everything else.
  | RehydrateAction
  // These can rearrange the `state.accounts` list itself.
  | AccountAction
  // These two are about a specific account… but not just the active one,
  // and they encode which one they mean.
  | AckPushTokenAction | UnackPushTokenAction
  ;

/** Plain actions not affecting any per-account state. */
// prettier-ignore
export type AccountIndependentAction =
  | SetGlobalSettingsAction
  // state.session
  | AppOnlineAction
  | AppOrientationAction
  | GotPushTokenAction
  | DebugFlagToggleAction
  ;

//
// `Action` itself.

/**
 * Covers all plain actions we ever `dispatch`.
 *
 * For *all* actions we ever dispatch, see also the thunk action types in
 * `reduxTypes.js`.
 */
// prettier-ignore
export type Action =
  // This should consist of the primary subtypes defined just above.
  | PerAccountAction
  | AllAccountsAction
  | AccountIndependentAction
  ;

//
// Other subtypes of `Action`.
//
// These should be unions of the primary subtypes, to express different
// meanings about what contexts the actions can be used in.

/** Plain actions that per-account reducers may respond to. */
// prettier-ignore
export type PerAccountApplicableAction =
  | PerAccountAction
  | AllAccountsAction
  ;

// Plain actions that global reducers may respond to are... well, at the
// moment we have no reducers that act only on global state.  Our state
// subtrees `session` and `settings` mix global with per-account state,
// while `accounts` contains per-account state for all accounts, and its
// reducer does respond to some of PerAccountAction as well as
// AllAccountsAction.
// TODO(#5006): Make a GlobalApplicableAction for global session and
//   settings state, once those are separate from per-account.

// TODO(#5006): would be nice to assert these types have empty intersection
// (a: PerAccountApplicableAction & AccountIndependentAction): empty => a; // eslint-disable-line
// (a: GlobalApplicableAction & PerAccountAction): empty => a; // eslint-disable-line
