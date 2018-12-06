/* @flow */
import type { Node } from 'react';
import type { IntlShape } from 'react-intl';
import type { InputSelector } from 'reselect';
import type { DangerouslyImpreciseStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { Action, NavigateAction } from './actionTypes';
import type {
  Auth,
  Topic,
  Message,
  Reaction,
  RealmEmojiState,
  RealmFilter,
  Narrow,
  Stream,
  Subscription,
  User,
} from './api/apiTypes';
import type { AppStyles } from './styles/theme';

export type { ChildrenArray } from 'react';
export type React$Node = Node; // eslint-disable-line flowtype/type-id-match

export type * from './actionTypes';
export type * from './api/apiTypes';

/*
 * TODO as the name suggests, this should be broken down more specifically.
 * Each use should be one of ViewStyleProp, TextStyleProp, ImageStyleProp.
 */
export type Style = DangerouslyImpreciseStyleProp;

export type Orientation = 'LANDSCAPE' | 'PORTRAIT';

export type Dimensions = {
  bottom: number,
  left: number,
  right: number,
  top: number,
};

export type InputSelectionType = {
  start: number,
  end: number,
};

/**
 * An identity belonging to this user in some Zulip org, including a secret.
 *
 * At present this consists of just the information the API client library
 * needs in order to talk to the server on the user's behalf, aka `Auth`.
 * NB in particular this includes an API key.
 *
 * In the future this might contain other metadata, if useful.
 *
 * See also `Identity`, which should be used instead where an API key is
 * not required.
 * TODO: move more code that way.
 */
export type Account = Auth;

/**
 * An identity belonging to this user in some Zulip org, with no secrets.
 *
 * This should be used in preference to `Auth` or `Account` in code that
 * doesn't need to make (authenticated) requests to the server and only
 * needs to pick their own email or ID out of a list, use the org's base URL
 * to make a relative URL absolute, etc.
 */
export type Identity = $Diff<Auth, { apiKey: string }>;

/** An aggregate of all the reactions with one emoji to one message. */
export type AggregatedReaction = {
  code: string,
  count: number,
  name: string,
  selfReacted: boolean,
  type: string,
};

/** A user, as seen in the `display_recipient` of a PM `Message`. */
export type PmRecipientUser = {
  email: string,
  full_name: string,
  id: number,
  is_mirror_dummy: boolean,
  short_name: string,
};

/**
 * An index on `MessagesState`, listing messages in each narrow.
 *
 * Keys are `JSON.stringify`-encoded `Narrow` objects.
 * Values are sorted lists of message IDs.
 *
 * See also `MessagesState`, which stores the message data indexed by ID.
 */
export type NarrowsState = {
  [narrow: string]: number[],
};

/**
 * A map with all messages we've stored locally, indexed by ID.
 *
 * See also `NarrowsState`, which is an index on this data that identifies
 * messages belonging to a given narrow.
 */
export type MessagesState = {
  [id: number]: $Exact<Message>,
};

export type UserIdMap = {
  [userId: string]: User,
};

export type UserGroup = {
  description: string,
  id: number,
  members: number[],
  name: string,
};

/** See ClientPresence, and the doc linked there. */
export type UserStatus = 'active' | 'idle' | 'offline';

/**
 * A user's presence status, summarized across all their clients.
 *
 * For an explanation of the Zulip presence model and how to interpret
 * `status` and `timestamp`, see the subsystem doc:
 *   https://zulip.readthedocs.io/en/latest/subsystems/presence.html
 *
 * For our logic to implement this aggregation, see `getAggregatedPresence`.
 */
export type PresenceAggregated = {
  client: string,
  status: UserStatus,
  timestamp: number,
};

/**
 * A user's presence status, as reported by a specific client.
 *
 * For an explanation of the Zulip presence model and how to interpret
 * `status` and `timestamp`, see the subsystem doc:
 *   https://zulip.readthedocs.io/en/latest/subsystems/presence.html
 *
 * @prop timestamp - When the server last heard from this client.
 * @prop status - See the presence subsystem doc.
 * @prop client
 * @prop pushable - Legacy; unused.
 */
export type ClientPresence = {
  status: UserStatus,
  timestamp: number,
  client: string,
  /* Indicates if the client can receive push notifications. This property
   * was intended for showing a user's presence status as "on mobile" if
   * they are inactive on all devices but can receive push notifications
   * (see zulip/zulip bd20a756f9). However, this property doesn't seem to be
   * used anywhere on the web app or the mobile client, and can be
   * considered legacy.
   */
  pushable: boolean,
};

/**
 * A user's presence status, including all information from all their clients.
 *
 * @prop aggregated - The summary of all available information, to be used
 *   to display the user's presence status.
 * @prop (client) - The information reported by each of the user's clients.
 */
export type Presence = {
  aggregated: PresenceAggregated,
  [client: string]: ClientPresence,
};

/**
 * Info about how complete our knowledge is of the messages in some narrow.
 *
 * @prop older - true just if in some fetch we reached the oldest message
 *   in the narrow.  No need to fetch more in that direction.
 * @prop newer - true just if in some fetch we reached the newest message in
 *   the narrow.  Of course their may always be new messages, but we should
 *   learn about them through events; so again, no need to fetch more.
 */
export type CaughtUp = {
  older: boolean,
  newer: boolean,
};

export type Fetching = {
  older: boolean,
  newer: boolean,
};

export type StreamsState = Stream[];

export type SubscriptionsState = Subscription[];

export type HeartbeatEvent = {
  type: 'heartbeat',
  id: number,
};

export type MessageEvent = {
  type: 'message',
  id: number,
};

export type PresenceEvent = {
  type: 'message',
  id: number,
  email: string,
  presence: { [client: string]: ClientPresence },
  server_timestamp: number,
};

export type UpdateMessageFlagsEvent = {
  type: 'update_message_flags',
  id: number,
  all: boolean,
  flag: 'read' | '???',
  messages: number[],
  operation: 'add' | '???',
};

export type EditMessage = {
  id: number,
  content: string,
  topic: string,
};

export type AccountsState = Account[];

export type Debug = {
  highlightUnreadMessages: boolean,
  doNotMarkMessagesAsRead: boolean,
};

/**
 * Miscellaneous non-persistent state about this run of the app.
 *
 * @prop lastNarrow - the last narrow we navigated to.  If the user is
 *   currently in a chat screen this will also be the "current" narrow,
 *   but they may also be on an associated info screen or have navigated
 *   away entirely.
 */
export type SessionState = {
  eventQueueId: number,
  editMessage: ?EditMessage,
  isOnline: boolean,
  isActive: boolean,
  isHydrated: boolean,
  lastNarrow: ?Narrow,
  needsInitialFetch: boolean,
  orientation: Orientation,
  outboxSending: boolean,
  safeAreaInsets: Dimensions,
  debug: Debug,
};

/**
 * Info about how completely we know the messages in each narrow of
 * MessagesState.
 */
export type CaughtUpState = {
  [narrow: string]: CaughtUp,
};

export type FetchingState = {
  [narrow: string]: Fetching,
};

export type FlagsState = {
  [flagName: string]: {
    [messageId: number]: boolean,
  },
};

export type MigrationsState = {
  version?: string,
};

export type LoadingState = {
  presence: boolean,
  subscriptions: boolean,
  streams: boolean,
  unread: boolean,
  users: boolean,
};

export type MuteTuple = [string, string];
export type MuteState = MuteTuple[];

export type NavigationState = {
  index: number,
  isTransitioning: boolean,
  key: string,
  routes: Array<{
    key: string,
    title: string,
    routeName: string,
    /** The fields in `params` vary by route; see `navActions.js`. */
    params: {
      narrow?: Narrow,
    },
  }>,
};

export type RealmBot = {
  email: string,
  full_name: string,
  is_admin: boolean,
  is_bot: true,
  user_id: number,
};

/**
 * State with general info about a Zulip organization; our state subtree `realm`.
 *
 * @prop twentyFourHourTime
 * @prop canCreateStreams
 * @prop crossRealmBots - The server's cross-realm bots; e.g., Welcome Bot.
 *   Cross-realm bots should be treated like normal bots.
 * @prop nonActiveUsers - All users in the organization with `is_active`
 *   false; for normal users, this means they or an admin deactivated their
 *   account.  See `User` and the linked documentation.
 * @prop pushToken
 * @prop filters
 * @prop emoji
 * @prop isAdmin
 */
export type RealmState = {|
  twentyFourHourTime: boolean,
  canCreateStreams: boolean,
  crossRealmBots: RealmBot[],
  nonActiveUsers: User[],
  pushToken: {|
    token: string,
    msg: string,
    result: string,
  |},
  filters: RealmFilter[],
  emoji: RealmEmojiState,
  isAdmin: boolean,
|};

export type TopicExtended = Topic & {
  isMuted: boolean,
  unreadCount: number,
};

export type TopicsState = {
  [number]: Topic[],
};

export type ThemeType = 'default' | 'night';

export type Context = {
  intl: IntlShape,
  styles: AppStyles,
  theme: ThemeType,
};

export type SettingsState = {|
  locale: string,
  theme: ThemeType,
  offlineNotification: boolean,
  onlineNotification: boolean,
  experimentalFeaturesEnabled: boolean,
  streamNotification: boolean,
|};

export type TypingState = {
  [normalizedRecipients: string]: {
    time: number,
    userIds: number[],
  },
};

/**
 * A message we're in the process of sending.
 *
 * See also `Message`.
 */
export type Outbox = {|
  isOutbox: true,
  isSent: boolean,

  markdownContent: string,
  narrow: Narrow,

  // These fields are modeled on `Message`.
  avatar_url: ?string,
  content: string,
  display_recipient: $FlowFixMe, // `string` for type stream, else PmRecipientUser[].
  id: number,
  reactions: Reaction[],
  sender_email: string,
  sender_full_name: string,
  subject: string,
  timestamp: number,
  type: 'stream' | 'private',

  // These fields are always absent here, but can appear in `Message`.  We
  // mention them here only to reassure Flow that they'll never be something
  // more interesting than `undefined`, in order to type-check accesses on
  // values of type `Message | Outbox`.
  last_edit_timestamp?: void,
  match_content?: void,
|};

export type StreamUnreadItem = {
  stream_id: number,
  topic: string,
  unread_message_ids: number[],
};

export type HuddlesUnreadItem = {
  user_ids_string: string,
  unread_message_ids: number[],
};

export type PmsUnreadItem = {
  sender_id: number,
  unread_message_ids: number[],
};

export type UnreadStreamsState = StreamUnreadItem[];
export type UnreadHuddlesState = HuddlesUnreadItem[];
export type UnreadPmsState = PmsUnreadItem[];
export type UnreadMentionsState = number[];

export type AlertWordsState = string[];

export type DraftsState = {
  [narrow: string]: string,
};

/**
 * A collection of (almost) all users in the Zulip org; our `users` state subtree.
 *
 * This contains all users except deactivated users and cross-realm bots.
 * For those, see RealmState.
 */
export type UsersState = User[];

export type UserGroupsState = UserGroup[];

/**
 * The `presence` subtree of our Redux state.
 *
 * @prop (email) - Indexes over all users for which the app has received a
 *   presence status.
 */
export type PresenceState = {
  [email: string]: Presence,
};

export type OutboxState = Outbox[];

export type UnreadState = {
  streams: UnreadStreamsState,
  huddles: UnreadHuddlesState,
  pms: UnreadPmsState,
  mentions: UnreadMentionsState,
};

/**
 * Our complete Redux state tree.
 *
 * Each property is a subtree maintained by its own reducer function.
 */
export type GlobalState = {|
  accounts: AccountsState,
  alertWords: AlertWordsState,
  caughtUp: CaughtUpState,
  drafts: DraftsState,
  fetching: FetchingState,
  flags: FlagsState,
  migrations: MigrationsState,
  loading: LoadingState,
  messages: MessagesState,
  mute: MuteState,
  narrows: NarrowsState,
  nav: NavigationState,
  outbox: OutboxState,
  presence: PresenceState,
  realm: RealmState,
  session: SessionState,
  settings: SettingsState,
  streams: StreamsState,
  subscriptions: SubscriptionsState,
  topics: TopicsState,
  typing: TypingState,
  unread: UnreadState,
  userGroups: UserGroupsState,
  users: UsersState,
|};

/** A selector returning TResult. */
// Seems like this should be OutputSelector... but for whatever reason,
// putting that on a selector doesn't cause the result type to propagate to
// the corresponding parameter when used in `createSelector`, and this does.
export type Selector<TResult> = InputSelector<GlobalState, void, TResult>;

export type MatchResult = Array<string> & { index: number, input: string };

export type GetState = () => GlobalState;

export type PlainDispatch = <A: Action | NavigateAction>(action: A) => A;

export interface Dispatch {
  <A: Action | NavigateAction>(action: A): A;
  <T>((Dispatch, GetState) => T): T;
}

export type LocalizableText = any; // string | { text: string, values: Object };

/**
 * Usually called `_`, and invoked like `_('Message')` -> `'Nachricht'`.
 *
 * Use `context: TranslationContext` in a React component; then in methods,
 * say `const _ = this.context`.
 *
 * Alternatively, for when `context` is already in use, use `withGetText`
 * and then say `const { _ } = this.props`.
 *
 * @prop intl - The full react-intl API, for more complex situations.
 */
export type GetText = {
  (string): string,
  intl: IntlShape,
};

export type RenderedTimeDescriptor = {|
  type: 'time',
  key: number | string,
  timestamp: number,
  firstMessage: Message | Outbox,
|};

export type RenderedMessageDescriptor = {|
  type: 'message',
  key: number | string,
  message: Message | Outbox,
  isBrief: boolean,
|};

export type RenderedSectionDescriptor = {|
  key: string | number,
  message: Message | Outbox | {||},
  data: $ReadOnlyArray<RenderedMessageDescriptor | RenderedTimeDescriptor>,
|};

export type DraftState = {
  [narrow: string]: string,
};

export type TimingItemType = {
  text: string,
  startMs: number,
  endMs: number,
};

export type UnreadTopic = {
  isMuted: boolean,
  key: string,
  topic: string,
  unread: number,
};

export type UnreadStream = {
  color: string,
  data: UnreadTopic[],
  isMuted: boolean,
  isPrivate: boolean,
  key: string,
  streamName: string,
  unread: number,
};

export type NotificationCommon = {
  alert: string,
  content: string,
  content_truncated: string, // boolean
  'google.message_id': string,
  'google.sent_time': number,
  'google.ttl': number,
  event: 'message',
  realm_id: string, // string
  sender_avatar_url: string,
  sender_email: string, // email
  sender_full_name: string,
  sender_id: string,
  server: string,
  time: string,
  user: string,
  zulip_message_id: string,
};

export type NotificationPrivate = NotificationCommon & {
  recipient_type: 'private',
};

export type NotificationGroup = NotificationCommon & {
  pm_users: string, // comma separated ids
  recipient_type: 'private',
};

export type NotificationStream = NotificationCommon & {
  recipient_type: 'stream',
  stream: string,
  topic: string,
};

export type Notification = NotificationPrivate | NotificationGroup | NotificationStream;

export type NamedUser = {
  id: number,
  email: string,
  full_name: string,
};

export type TabNavigationOptionsPropsType = {
  isFocussed: boolean,
  tintColor: string,
};

export type NeverSubscribedStream = {
  description: string,
  invite_only: boolean,
  is_old_stream: boolean,
  name: string,
  stream_id: number,
};

/**
 * Summary of a PM conversation (either 1:1 or group PMs).
 */
export type PmConversationData = {
  ids: string,
  msgId: number,
  recipients: string,
  timestamp: number,
  unread: number,
};

export type InitialDataBase = {
  last_event_id: number,
  msg: string,
  queue_id: number,
};

export type InitialDataAlertWords = {
  alert_words: string[],
};

export type InitialDataMessage = {
  max_message_id: number,
};

export type InitialDataMutedTopics = {
  muted_topics: MuteTuple[],
};

export type InitialDataPresence = {
  presences: PresenceState,
};

export type InitialDataRealm = {
  max_icon_file_size: number,
  realm_add_emoji_by_admins_only: boolean,
  realm_allow_community_topic_editing: boolean,
  realm_allow_edit_history: boolean,
  realm_allow_message_deleting: boolean,
  realm_allow_message_editing: boolean,
  realm_authentication_methods: { GitHub: true, Email: true, Google: true },
  realm_available_video_chat_providers: string[],
  realm_bot_creation_policy: number,
  realm_bot_domain: string,
  realm_create_stream_by_admins_only: boolean,
  realm_default_language: string,
  realm_default_twenty_four_hour_time: boolean,
  realm_description: string,
  realm_disallow_disposable_email_addresses: boolean,
  realm_email_auth_enabled: boolean,
  realm_email_changes_disabled: boolean,
  realm_google_hangouts_domain: string,
  realm_icon_source: string,
  realm_icon_url: string,
  realm_inline_image_preview: boolean,
  realm_inline_url_embed_preview: boolean,
  realm_invite_by_admins_only: boolean,
  realm_invite_required: boolean,
  realm_is_zephyr_mirror_realm: boolean,
  realm_mandatory_topics: boolean,
  realm_message_content_delete_limit_seconds: number,
  realm_message_content_edit_limit_seconds: number,
  realm_message_retention_days: ?number,
  realm_name: string,
  realm_name_changes_disabled: boolean,
  realm_notifications_stream_id: number,
  realm_password_auth_enabled: boolean,
  realm_presence_disabled: boolean,
  realm_restricted_to_domain: boolean,
  realm_send_welcome_emails: boolean,
  realm_show_digest_email: boolean,
  realm_signup_notifications_stream_id: number,
  realm_uri: string,
  realm_video_chat_provider: string,
  realm_waiting_period_threshold: number,
};

export type InitialDataRealmEmoji = {
  realm_emoji: RealmEmojiState,
};

export type InitialDataRealmFilters = {
  realm_filters: RealmFilter[],
};

export type InitialDataRealmUser = {
  avatar_source: 'G',
  avatar_url: string,
  avatar_url_medium: string,
  can_create_streams: boolean,
  cross_realm_bots: RealmBot[],
  email: string,
  enter_sends: boolean,
  full_name: string,
  is_admin: boolean,
  realm_non_active_users: User[],
  realm_users: User[],
  user_id: number,
};

export type InitialDataRealmUserGroups = {
  realm_user_groups: UserGroup[],
};

export type InitialDataSubscription = {
  never_subscribed: NeverSubscribedStream[],
  subscriptions: Subscription[],
  unsubscribed: Subscription[],
};

export type InitialDataUpdateDisplaySettings = {
  default_language: string,
  emojiset: string,
  emojiset_choices: { [string]: string },
  high_contrast_mode: boolean,
  left_side_userlist: boolean,
  night_mode: boolean,
  timezone: string,
  translate_emoticons: boolean,
  twenty_four_hour_time: boolean,
};

export type InitialDataUpdateGlobalNotifications = {
  default_desktop_notifications: boolean,
  enable_desktop_notifications: boolean,
  enable_digest_emails: boolean,
  enable_offline_email_notifications: boolean,
  enable_offline_push_notifications: boolean,
  enable_online_push_notifications: boolean,
  enable_sounds: boolean,
  enable_stream_desktop_notifications: boolean,
  enable_stream_email_notifications: boolean,
  enable_stream_push_notifications: boolean,
  enable_stream_sounds: boolean,
  message_content_in_email_notifications: boolean,
  pm_content_in_desktop_notifications: boolean,
  realm_name_in_notifications: boolean,
};

export type InitialDataUpdateMessageFlags = {
  unread_msgs: {
    streams: UnreadStreamsState,
    huddles: UnreadHuddlesState,
    count: number,
    pms: UnreadPmsState,
    mentions: UnreadMentionsState,
  },
};

export type InitialData = InitialDataBase &
  InitialDataAlertWords &
  InitialDataMessage &
  InitialDataMutedTopics &
  InitialDataPresence &
  InitialDataRealm &
  InitialDataRealmEmoji &
  InitialDataRealmFilters &
  InitialDataRealmUser &
  InitialDataRealmUserGroups &
  InitialDataSubscription &
  InitialDataUpdateDisplaySettings &
  InitialDataUpdateGlobalNotifications &
  InitialDataUpdateMessageFlags;
