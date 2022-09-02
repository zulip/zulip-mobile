/**
 * Types describing our Redux state and store.
 *
 * This isn't the place for types that are borrowed from the API;
 * those go under `src/api/` (typically in `src/api/modelTypes.js`)
 * and can be imported here as needed.
 *
 * @flow strict-local
 */
import type Immutable from 'immutable';
import type { InputSelector } from 'reselect';

import type { Account, Outbox } from './types';
import type { Action, DispatchableWithoutAccountAction } from './actionTypes';
import type {
  CustomProfileField,
  Topic,
  Message,
  CrossRealmBot,
  RealmEmojiById,
  RealmFilter,
  Stream,
  Subscription,
  User,
  UserGroup,
  UserId,
  UserPresence,
  CreatePublicOrPrivateStreamPolicyT,
  CreateWebPublicStreamPolicy,
} from './api/apiTypes';
import type {
  PerAccountSessionState,
  GlobalSessionState,
  SessionState,
} from './session/sessionReducer';
import type { MuteState } from './mute/muteModelTypes';
import type { PmConversationsState } from './pm-conversations/pmConversationsModel';
import type { UnreadState } from './unread/unreadModelTypes';
import type { UserStatusesState } from './user-statuses/userStatusesCore';
import type { ServerEmojiData, UserMessageFlag } from './api/modelTypes';
import type { EmailAddressVisibility } from './api/permissionsTypes';
import { typesEquivalent } from './generics';

export type { MuteState } from './mute/muteModelTypes';
export type { UserStatusesState } from './user-statuses/userStatusesCore';
export type * from './actionTypes';

/* eslint-disable no-unused-expressions */

/**
 * The list of known accounts, with the active account first.
 *
 * Some accounts in the list may have a blank API key (if the user hasn't
 * yet completed login, or has logged out) or even a blank email (if the
 * user hasn't completed login.)
 *
 * See:
 *  * "active account" in `docs/glossary.md`.
 *  * `getIdentity`, `getAuth`, and related selectors, for getting
 *    information about the active account as needed in most codepaths of
 *    the app.
 *  * `Account` for details on the properties of each account object.
 */
export type AccountsState = $ReadOnlyArray<Account>;

export type AlertWordsState = $ReadOnlyArray<string>;

/**
 * Info about how complete our knowledge is of the messages in some narrow.
 *
 * @prop older - true just if in some fetch we reached the oldest message
 *   in the narrow.  No need to fetch more in that direction.
 * @prop newer - true just if in some fetch we reached the newest message in
 *   the narrow.  Of course their may always be new messages, but we should
 *   learn about them through events; so again, no need to fetch more.
 */
export type CaughtUp = $ReadOnly<{|
  older: boolean,
  newer: boolean,
|}>;

/**
 * Info about how completely we know the messages in each narrow.
 *
 * The keys correspond to the keys in `NarrowsState`.
 *
 * See `CaughtUp` for details on what each value means.
 */
export type CaughtUpState = $ReadOnly<{|
  [narrow: string]: CaughtUp,
|}>;

/**
 * The user's draft message, if any, in each conversation.
 *
 * The keys correspond to the keys in `NarrowsState`.
 */
export type DraftsState = $ReadOnly<{|
  [narrow: string]: string,
|}>;

export type Fetching = $ReadOnly<{|
  older: boolean,
  newer: boolean,
|}>;

/**
 * Info about which narrows we're actively fetching more messages from.
 *
 * The keys correspond to the keys in `NarrowsState`.
 *
 * See also: `CaughtUpState`, `NarrowsState`.
 */
export type FetchingState = $ReadOnly<{|
  [narrow: string]: Fetching,
|}>;

/**
 * The message flags corresponding to all the messages in `MessagesState`.
 *
 * Unlike almost all other subtrees of our state, this one can be
 * incomplete, always in exactly the same way that `MessagesState` is.
 *
 * We expect most of these flags to be very sparse: the number of messages
 * you have starred, or where you're @-mentioned, is typically a very small
 * fraction of the total number of messages you have. That's why it probably
 * doesn't make sense for this data structure to explicitly indicate "not
 * starred", "not @-mentioned", etc., for every known message. That could
 * significantly increase the memory and storage requirement when we know
 * about a lot of messages. If we need to distinguish "unknown message" from
 * "message without flag", we can look up the message ID in
 * `state.messages`.
 */
export type FlagsState = $ReadOnly<{|
  read: {| +[messageId: number]: true |},
  starred: {| +[messageId: number]: true |},
  collapsed: {| +[messageId: number]: true |},
  mentioned: {| +[messageId: number]: true |},
  wildcard_mentioned: {| +[messageId: number]: true |},
  has_alert_word: {| +[messageId: number]: true |},
  historical: {| +[messageId: number]: true |},
|}>;

// The flags in FlagsState correspond with those in the server API,
// as expressed by UserMessageFlag.
typesEquivalent<$Keys<FlagsState>, UserMessageFlag>();

/**
 * A map with all messages we've stored locally, indexed by ID.
 *
 * For almost all types of data we need from the server, we use the Zulip
 * event system to get a complete snapshot and to maintain it incrementally.
 * See `registerAndStartPolling` for discussion, and see our docs from the
 * client-side perspective:
 *   https://github.com/zulip/zulip-mobile/blob/main/docs/architecture/realtime.md
 * and a mainly server-side perspective:
 *   https://zulip.readthedocs.io/en/latest/subsystems/events-system.html
 * As a result, there are very few types of data we need to go fetch from
 * the server as the user navigates through the app or as different
 * information is to appear on screen.
 *
 * Message data is the one major exception.  For new messages while we're
 * online, and updates to existing messages, we learn them in real time
 * through the event system; but because the full history of messages can be
 * very large, it's left out of the snapshot obtained through `/register` by
 * `registerAndStartPolling`.  Instead, we fetch specific message history as
 * needed.
 *
 * This subtree of our state stores all the messages we've fetched, prompted
 * by any of a variety of reasons.
 *
 * Although this map is *incomplete*, it should always be *accurate* about
 * each message it does contain -- once a message appears here, we use the
 * Zulip event system to make sure it stays up to date through edits, emoji
 * reactions, or other changes to its data.
 *
 * These `Message` objects lack the `flags` property; we store that
 * information separately, as `FlagsState`.
 *
 * See also `NarrowsState`, which is an index on this data that identifies
 * messages belonging to a given narrow.
 */
export type MessagesState = Immutable.Map<number, Message>;

export type MigrationsState = $ReadOnly<{|
  version?: number,
|}>;

/** A map from user IDs to the Unix timestamp in seconds when they were muted. */
export type MutedUsersState = Immutable.Map<UserId, number>;

/**
 * An index on `MessagesState`, listing messages in each narrow.
 *
 * Unlike almost all other subtrees of our state, this one can be incomplete
 * compared to the data that exists on the server and the user has access
 * to; see `MessagesState` for more context.  The data here should
 * correspond exactly to the data in `MessagesState`.
 *
 * Keys are those given by `keyFromNarrow`.
 * Values are sorted lists of message IDs.
 *
 * See also:
 *  * `MessagesState`, which stores the message data indexed by ID;
 *  * `CaughtUpState` for information about where this data *is*
 *    complete for a given narrow;
 *  * `FetchingState` for information about which narrows we're actively
 *    fetching more messages from.
 */
export type NarrowsState = Immutable.Map<string, $ReadOnlyArray<number>>;

export type OutboxState = $ReadOnlyArray<Outbox>;

/**
 * The `presence` subtree of our Redux state.
 *
 * @prop (email) - Indexes over all users for which the app has received a
 *   presence status.
 */
export type PresenceState = $ReadOnly<{|
  [email: string]: UserPresence,
|}>;

/**
 * Configuration for a video chat provider, as specified by the server.
 *
 * The `name` property identifies the selected provider.  Depending on the
 * provider, other properties may provide other configuration details
 * required.
 *
 * See `src/realm/realmReducer.js` for where these values are produced based
 * on information from the server.
 */
// Right now there's just one branch here; if we add another provider, this
// should become a disjoint union on `name`.
export type VideoChatProvider = $ReadOnly<{| name: 'jitsi_meet', jitsiServerUrl: string |}>;

/**
 * State with miscellaneous data from the server; our state subtree `realm`.
 *
 * "Initial data", below, refers to data in the register-queue response:
 *   https://zulip.com/api/register-queue#response
 *
 * Despite the name, this info doesn't necessarily have much to do with the
 * Zulip organization/realm; some properties do, but others are per-user,
 * and others are per-server.
 *
 * About the server:
 * @prop crossRealmBots - Corresponds to cross_realm_bots in initial data.
 *   We use our `AvatarURL` class at `.avatar_url`.
 *
 * About the org/realm:
 * @prop name - Corresponds to realm_name in initial data.
 * @prop description - Corresponds to realm_description in initial data.
 * @prop nonActiveUsers - Corresponds to realm_non_active_users in initial
 *   data. We use our `AvatarURL` class at `.avatar_url`.
 * @prop filters - Corresponds to realm_linkifiers/realm_filters in initial
 *   data. For now, we use the legacy realm_filters form internally.
 * @prop emoji - Corresponds to realm_emoji in initial data.
 * @prop videoChatProvider - The video chat provider configured by the
 *   server; null if none, or if the configured provider is one we don't
 *   support.
 * @prop mandatoryTopics - Corresponds to realm_mandatory_topics in initial
 *   data.
 * @prop messageContentDeleteLimitSeconds - Corresponds to
 *   realm_message_content_delete_limit_seconds in initial data. We use the
 *   Zulip Server 5.0+ convention that `null` means no limit, and 0 is
 *   invalid.
 * @prop messageContentEditLimitSeconds - Corresponds to
 *   realm_message_content_edit_limit_seconds in initial data.
 * @prop pushNotificationsEnabled - Corresponds to
     realm_push_notifications_enabled in initial data.
 *
 * About the user:
 * @prop email
 * @prop user_id
 * @prop twentyFourHourTime
 * @prop canCreateStreams
 * @prop isAdmin
 */
export type RealmState = {|
  //
  // InitialDataCustomProfileFields
  //

  +customProfileFields: $ReadOnlyArray<CustomProfileField>,

  //
  // InitialDataRealm
  //

  +name: string,
  +description: string,
  +nonActiveUsers: $ReadOnlyArray<User>,
  +filters: $ReadOnlyArray<RealmFilter>,
  +emoji: RealmEmojiById,
  +defaultExternalAccounts: Map<string, {| +url_pattern: string |}>,
  +videoChatProvider: VideoChatProvider | null,
  +mandatoryTopics: boolean,
  +messageContentDeleteLimitSeconds: number | null,
  +messageContentEditLimitSeconds: number,
  +pushNotificationsEnabled: boolean,
  +createPublicStreamPolicy: CreatePublicOrPrivateStreamPolicyT,
  +createPrivateStreamPolicy: CreatePublicOrPrivateStreamPolicyT,
  +webPublicStreamsEnabled: boolean,
  +createWebPublicStreamPolicy: CreateWebPublicStreamPolicy,
  +enableSpectatorAccess: boolean,
  +waitingPeriodThreshold: number,
  +allowEditHistory: boolean,
  +enableReadReceipts: boolean,
  +emailAddressVisibility: EmailAddressVisibility,

  //
  // InitialDataRealmUser
  //

  +canCreateStreams: boolean,

  // Deprecated; these don't have events to update them. Use getOwnUserRole,
  // which uses the self-user's live-updating `role` property when
  // available.
  // TODO(server-4.0): Remove these and rely on self-user's `role`.
  -isAdmin: boolean,
  -isOwner: boolean,
  -isModerator: boolean,
  -isGuest: boolean,

  +user_id: UserId | void,
  +email: string | void,
  +crossRealmBots: $ReadOnlyArray<CrossRealmBot>,

  //
  // InitialDataUserSettings
  //

  +twentyFourHourTime: boolean,

  //
  // Misc.: Not in the /register response.
  //

  /**
   * Our most recent read of the server_emoji_data_url data, if any.
   *
   * We check for changes in the data after every /register; see comment
   * where we dispatch maybeRefreshServerEmojiData.
   */
  +serverEmojiData: ServerEmojiData | null,
|};

// TODO: Stop using the 'default' name. Any 'default' semantics should
// only apply the device level, not within the app. See
// https://github.com/zulip/zulip-mobile/issues/4009#issuecomment-619280681.
export type ThemeName = 'default' | 'night';

/** What browser the user has set to use for opening links in messages.
 *
 * * embedded: The in-app browser
 * * external: The user's default browser app
 * * default: 'external' on iOS, 'embedded' on Android
 *
 * Use the `shouldUseInAppBrowser` function from src/utils/openLink.js in order to
 * parse this.
 *
 * See https://chat.zulip.org/#narrow/stream/48-mobile/topic/in-app.20browser
 * for the reasoning behind these options.
 */
export type BrowserPreference = 'embedded' | 'external' | 'default';

/**
 * The user's chosen settings specific to this account.
 */
export type PerAccountSettingsState = $ReadOnly<{
  offlineNotification: boolean,
  onlineNotification: boolean,
  streamNotification: boolean,
  displayEmojiReactionUsers: boolean,
  ...
}>;

/**
 * The user's chosen settings independent of account, on this client.
 *
 * These apply across all the user's accounts on this client (i.e. on this
 * install of the app on this device).
 *
 * See also {@link PerAccountSettingsState}.
 */
// Because these apply independent of account, they necessarily can't come
// from the server.
export type GlobalSettingsState = $ReadOnly<{
  // The user's chosen language, as an IETF BCP 47 language tag.
  language: string,

  theme: ThemeName,
  browser: BrowserPreference,

  // TODO cut this? what was it?
  experimentalFeaturesEnabled: boolean,

  // Possibly this should be per-account.  If so it should probably be put
  // on the server, so it can also be cross-device for the account.
  markMessagesReadOnScroll: 'always' | 'never' | 'conversation-views-only',

  ...
}>;

/**
 * The user's chosen settings.
 *
 * This is a mix of server data representing the active account (see
 * {@link PerAccountSettingsState}), and client-only data that applies
 * across all the user's accounts on this client (see
 * {@link GlobalSettingsState}).
 */
export type SettingsState = $ReadOnly<{|
  ...$Exact<GlobalSettingsState>,
  ...$Exact<PerAccountSettingsState>,
|}>;

// As part of letting GlobalState freely convert to PerAccountState,
// we'll want the same for SettingsState.  (This is also why
// PerAccountSettingsState is inexact.)
(s: SettingsState): PerAccountSettingsState => s;

export type StreamsState = $ReadOnlyArray<Stream>;

export type SubscriptionsState = $ReadOnlyArray<Subscription>;

export type TopicsState = $ReadOnly<{|
  [number]: $ReadOnlyArray<Topic>,
|}>;

export type TypingState = $ReadOnly<{|
  [normalizedRecipients: string]: $ReadOnly<{|
    time: number,
    userIds: $ReadOnlyArray<UserId>,
  |}>,
|}>;

export type UserGroupsState = $ReadOnlyArray<UserGroup>;

/**
 * A collection of (almost) all users in the Zulip org; our `users` state subtree.
 *
 * This contains all users except deactivated users and cross-realm bots.
 * For those, see RealmState.
 */
export type UsersState = $ReadOnlyArray<User>;

/* eslint-disable no-use-before-define */

/**
 * The portion of our Redux state with a single account's data.
 *
 * In a multi-account world (#5005), the full Redux state will contain one
 * of these per account.  Before that, in a multi-account-ready schema
 * (#5006), the full Redux state may contain just one of these but as a
 * subtree somewhere inside it.
 *
 * Initially, though, the full Redux state tree actually qualifies as a
 * value of this type, and the values of this type we pass around are
 * secretly just the full Redux state.  The purpose of this type is to
 * expose only the data that in a multi-account future will live on a single
 * account's state subtree, and to recruit Flow's help in tracking which
 * parts of our code will in that future operate on a particular account and
 * which parts will operate on all accounts' data or none.
 */
type PerAccountStateImpl = $ReadOnly<{
  // TODO(#5006): Secretly we assume these objects also have `Account` data,
  //   like so:
  // accounts: [Account, ...mixed],
  //   which they do because they're always actually `GlobalState` objects.
  //   Need to put that data somewhere that's less mixed up with other accounts'
  //   data.  See `accountsSelectors` for where we make that assumption.

  // Jumbles of per-account state and client state.
  session: PerAccountSessionState,
  settings: PerAccountSettingsState,

  // Per-account state that's *not* from the server.
  drafts: DraftsState,
  outbox: OutboxState,

  // Per-account state: server data for the active account.
  alertWords: AlertWordsState,
  caughtUp: CaughtUpState,
  fetching: FetchingState,
  flags: FlagsState,
  messages: MessagesState,
  mute: MuteState,
  mutedUsers: MutedUsersState,
  narrows: NarrowsState,
  pmConversations: PmConversationsState,
  presence: PresenceState,
  realm: RealmState,
  streams: StreamsState,
  subscriptions: SubscriptionsState,
  topics: TopicsState,
  typing: TypingState,
  unread: UnreadState,
  userGroups: UserGroupsState,
  userStatuses: UserStatusesState,
  users: UsersState,

  ...
}>;

export opaque type PerAccountState: PerAccountStateImpl = PerAccountStateImpl;

/**
 * Our complete Redux state tree.
 *
 * Each property is a subtree maintained by its own reducer function.  These
 * are named in a regular pattern; see also `src/boot/reducers.js`.
 *
 * We use `redux-persist` to write parts of this state tree to persistent
 * device storage that survives when the app is closed, and to read it back
 * ("rehydrate" it) from that storage at launch time.  See `src/boot/store.js`.
 * Other parts of the state tree are not persisted.
 *
 * See in particular `discardKeys`, `storeKeys`, and `cacheKeys`, which
 * identify which subtrees are persisted and which are not.
 */
export type GlobalState = $ReadOnly<{|
  ...$Exact<PerAccountState>,

  // Metadata for the global state, as persisted on disk.
  migrations: MigrationsState,

  // Jumbles of per-account state and client state.
  session: SessionState,
  settings: SettingsState,

  // Per-account state but for all accounts together.
  // Mix of server data and otherwise.
  accounts: AccountsState,
|}>;

/**
 * Assume the given per-account state object is secretly a GlobalState.
 *
 * At present, this assumption is always true.  But in the future it won't
 * be.  Calling this function has much the same effect as a fixme, but just
 * makes it quite explicit that this particular assumption is being used.
 *
 * TODO(#5006): We'll have to fix and eliminate each call to this.
 */
export function assumeSecretlyGlobalState(state: PerAccountState): GlobalState {
  // $FlowFixMe[incompatible-exact]
  // $FlowFixMe[prop-missing]
  return state;
}

/**
 * Use the given state object as a per-account state.
 *
 * TODO(#5006): We'll have to fix and eliminate each call to this.
 */
export function dubPerAccountState(state: GlobalState): PerAccountState {
  // Here in this file, we can make this cast with no fixmes (for now, under
  // our single-active-account model.)  But from anywhere outside this file,
  // that's forbidden because PerAccountState is opaque, so the way to do it
  // is by calling this function.
  return state;
}

/**
 * For tests only.  Use the given state object as *both* kinds of state.
 *
 * TODO(#5006): We'll have to fix and eliminate each call to this.
 */
export function dubJointState(state: GlobalState): GlobalState & PerAccountState {
  return state;
}

// No substate should allow `undefined`; our use of AsyncStorage
// depends on it. (This check will also complain on `null`, which I
// don't think we'd have a problem with. We could try to write this
// differently if we want to allow `null`.)
type NonMaybeProperties<O: { ... }> = $ObjMap<O, <V>(V) => $NonMaybeType<V>>;
type NonMaybeGlobalState = NonMaybeProperties<GlobalState>;
// This function definition will fail typechecking if GlobalState is wrong.
(s: GlobalState): NonMaybeGlobalState => s;

/** A per-account selector returning TResult, with extra parameter TParam. */
// Seems like this should be OutputSelector... but for whatever reason,
// putting that on a selector doesn't cause the result type to propagate to
// the corresponding parameter when used in `createSelector`, and this does.
export type Selector<TResult, TParam = void> = InputSelector<PerAccountState, TParam, TResult>;

/** A GlobalState selector returning TResult, with extra parameter TParam. */
// Seems like this should be OutputSelector; see comment on Selector above.
export type GlobalSelector<TResult, TParam = void> = InputSelector<GlobalState, TParam, TResult>;

/**
 * The extras object passed to a per-account thunk action.
 *
 * This allows the thunk action to get access to information which isn't on
 * PerAccountState, but which is perfectly legitimate for per-account code
 * to use.
 */
export type ThunkExtras = $ReadOnly<{
  getGlobalSession: () => GlobalSessionState,
  getGlobalSettings: () => GlobalSettingsState,
  ...
}>;

/** The Redux `dispatch` for a per-account context. */
export interface Dispatch {
  <A: Action>(action: A): A;
  <T>(ThunkAction<T>): T;
}

/** A per-account thunk action returning T. */
export type ThunkAction<T> = (Dispatch, () => PerAccountState, ThunkExtras) => T;

/** The Redux `dispatch` for a global context. */
export interface GlobalDispatch {
  <A: DispatchableWithoutAccountAction>(action: A): A;
  <T>(GlobalThunkAction<T>): T;
}

/** A global thunk action returning T. */
// This might take some extras later (e.g., to do something per-account on a
// specific account), but for now it needs none.
export type GlobalThunkAction<T> = (GlobalDispatch, () => GlobalState) => T;

// The two pairs of dispatch/thunk-action types aren't interchangeable,
// in either direction.
//   $FlowExpectedError[incompatible-return]
(d: GlobalDispatch): Dispatch => d;
//   $FlowExpectedError[incompatible-return]
<T>(a: ThunkAction<T>): GlobalThunkAction<T> => a;
//   $FlowExpectedError[incompatible-return]
(d: Dispatch): GlobalDispatch => d;
//   $FlowExpectedError[incompatible-exact]
//   $FlowExpectedError[prop-missing]
//   $FlowExpectedError[incompatible-return]
<T>(a: GlobalThunkAction<T>): ThunkAction<T> => a;
