/* @flow */
import type { Dispatch as ReduxDispatch } from 'redux';
import type { IntlShape } from 'react-intl';
import type { InputSelector } from 'reselect';

import type { AppStyles } from './styles/theme';

export type { ChildrenArray } from 'react';

export type AnimatedValue = any; // { AnimatedValue } from 'react-native';
export type MapStateToProps = any; // { MapStateToProps } from 'react-redux';

export type * from './actionTypes';
export type * from './api/apiTypes';

export type ThunkDispatch<T> = ((Dispatch, GetState) => T) => T;

export type Dispatch = ReduxDispatch<*> & ThunkDispatch<*>;

export type Style = boolean | number | Array<Style> | ?{ [string]: any };

export type Orientation = 'LANDSCAPE' | 'PORTRAIT';

export type Dimensions = {
  bottom: number,
  left: number,
  right: number,
  top: number,
};

export type ObjectWithId = {
  id: number,
  [key: string]: any,
};

export type ObjectsMappedById = {
  [key: number]: ObjectWithId,
};

export type Auth = {
  realm: string,
  apiKey: string,
  email: string,
};

export type InputSelectionType = {
  start: number,
  end: number,
};

export type Account = Auth;

/**
 * An emoji reaction to a message, in minimal form.
 *
 * See also EventReaction, which carries additional properties computed from
 * these.
 */
export type SlimEventReaction = {
  emoji_name: string,
  user: any,
};

/**
 * An emoji reaction to a message.
 *
 * See also SlimEventReaction, which contains the minimal subset of these
 * properties needed to compute the rest.
 */
export type EventReaction = {
  emoji_code: string,
  emoji_name: string,
  reaction_type: string,
  user: any,
};

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

export type MessageEdit = {
  prev_content?: string,
  prev_rendered_content?: string,
  prev_rendered_content_version?: number,
  prev_subject?: string,
  timestamp: number,
  user_id: number,
};

/**
 * A Zulip message.
 *
 * This type is mainly intended to represent the data the server sends as
 * the `message` property of an event of type `message`.  Caveat lector: we
 * pass these around to a lot of places, and do a lot of further munging, so
 * this type may not quite represent that.  Any differences should
 * definitely be commented, and perhaps refactored.
 *
 * The server's behavior here is undocumented and the source is very
 * complex; this is naturally a place where a large fraction of all the
 * features of Zulip have to appear.
 *
 * References include:
 *  * the two example events at https://zulipchat.com/api/get-events-from-queue
 *  * `process_message_event` in zerver/tornado/event_queue.py; the call
 *    `client.add_event(user_event)` makes the final determination of what
 *    goes into the event, so `message_dict` is the final value of `message`
 *  * `MessageDict.wide_dict` and its helpers in zerver/lib/message.py;
 *    via `do_send_messages` in `zerver/lib/actions.py`, these supply most
 *    of the data ultimately handled by `process_message_event`
 *  * the `Message` and `AbstractMessage` models in zerver/models.py, but
 *    with caution; many fields are adjusted between the DB row and the event
 *  * empirical study looking at Redux events logged [to the
 *    console](docs/howto/debugging.md).
 *
 * See also `Outbox`.
 */
export type Message = {
  /** Our own flag; if true, really type `Outbox`. */
  isOutbox: false,

  /**
   * These don't appear in `message` events, but they appear in GET
   * requests for messages in a narrow when a search is involved.
   */
  match_content?: string,
  match_subject?: string,

  /** Obsolete? Gone in server commit 1.6.0~1758 . */
  sender_domain: string,

  /** The rest are believed to really appear in `message` events. */
  avatar_url: ?string,
  client: string,
  content: string,
  content_type: 'text/html' | 'text/markdown',
  display_recipient: $FlowFixMe, // `string` for type stream, else PmRecipientUser[].
  edit_history: MessageEdit[],
  flags: string[],
  gravatar_hash: string,
  id: number,
  is_me_message: boolean,
  reactions: SlimEventReaction[],
  recipient_id: number,
  sender_email: string,
  sender_full_name: string,
  sender_id: number,
  sender_realm_str: string,
  sender_short_name: string,
  stream_id: number, // FixMe: actually only for type `stream`, else absent.
  subject: string,
  subject_links: string[],
  submessages: Message[],
  timestamp: number,
  type: 'stream' | 'private',
};

export type MessagesState = {
  [narrow: string]: Message[],
};

/**
 * A Zulip user.
 *
 * For details on the properties, see the Zulip API docs:
 *   https://zulipchat.com/api/get-all-users#response
 */
export type User = {
  avatar_url: ?string,
  bot_type?: number,
  bot_owner?: string,
  email: string,
  full_name: string,
  is_admin: boolean,
  is_bot: boolean,
  profile_data?: Object,
  timezone: string,
  user_id: number,
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

export type DevUser = {
  realm_uri: string,
  email: string,
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

export type Stream = {
  stream_id: number,
  description: string,
  name: string,
  invite_only: boolean,
  is_announcement_only: boolean,
};

export type StreamsState = Stream[];

export type Subscription = Stream & {
  color: string,
  in_home_view: boolean,
  pin_to_top: boolean,
  audible_notifications: boolean,
  desktop_notifications: boolean,
  email_address: string,
  push_notifications: boolean,
  is_old_stream: boolean,
  push_notifications: boolean,
  stream_weekly_traffic: number,
};

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

export type NarrowOperator =
  | 'is'
  | 'in'
  | 'near'
  | 'id'
  | 'stream'
  | 'topic'
  | 'sender'
  | 'pm-with'
  | 'search';

export type NarrowElement = {
  operand: string,
  operator?: NarrowOperator, // TODO type: this shouldn't be absent.
};

export type Narrow = NarrowElement[];

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

export type SessionState = {
  eventQueueId: number,
  editMessage: ?EditMessage,
  isOnline: boolean,
  isActive: boolean,
  isHydrated: boolean,
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

export type FlagMap = {
  [number]: boolean,
};

export type FlagsState = {
  [string]: FlagMap,
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
  routes: Array<any> /* <{
    key: string,
    title: string,
  }>, */,
};

export type RealmFilter = [string, string, number];

export type RealmEmojiType = {
  author: {
    email: string,
    full_name: string,
    id: number,
  },
  deactivated: boolean,
  id: number,
  name: string,
  source_url: string,
  // This prevents accidentally using this type as a map.
  // See https://github.com/facebook/flow/issues/4257#issuecomment-321951793
  [any]: mixed,
};

export type RealmEmojiState = {
  [id: string]: RealmEmojiType,
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
export type RealmState = {
  twentyFourHourTime: boolean,
  canCreateStreams: boolean,
  crossRealmBots: RealmBot[],
  nonActiveUsers: User[],
  pushToken: {
    token: string,
    msg: string,
    result: string,
  },
  filters: RealmFilter[],
  emoji: RealmEmojiState,
  isAdmin: boolean,
};

export type Topic = {
  name: string,
  max_id: number,
};

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

export type StatusBarStyle = 'light-content' | 'dark-content';

export type SettingsState = {
  locale: string,
  theme: ThemeType,
  offlineNotification: boolean,
  onlineNotification: boolean,
  experimentalFeaturesEnabled: boolean,
  streamNotification: boolean,
};

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
export type Outbox = {
  isOutbox: true,

  markdownContent: string,
  narrow: Narrow,

  // These fields are modeled on `Message`.
  display_recipient: $FlowFixMe, // `string` for type stream, else PmRecipientUser[].
  id: number,
  sender_email: string,
  sender_full_name: string,
  subject: string,
  timestamp: number,
  type: 'stream' | 'private',
};

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
export type GlobalState = {
  accounts: AccountsState,
  alertWords: AlertWordsState,
  caughtUp: CaughtUpState,
  drafts: DraftsState,
  fetching: FetchingState,
  flags: FlagsState,
  loading: LoadingState,
  messages: MessagesState,
  mute: MuteState,
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
};

/** A selector returning TResult. */
// Seems like this should be OutputSelector... but for whatever reason,
// putting that on a selector doesn't cause the result type to propagate to
// the corresponding parameter when used in `createSelector`, and this does.
export type Selector<TResult> = InputSelector<GlobalState, void, TResult>;

export type MatchResult = Array<string> & { index: number, input: string };

export type GetState = () => GlobalState;

export type LocalizableText = any; // string | { text: string, values: Object };

export type RenderedTimeDescriptor = {
  type: 'time',
  timestamp: number,
};

export type RenderedMessageDescriptor = {
  type: 'message',
  message: Object,
};

export type RenderedItemDescriptor = any; // MessageDescriptor | TimeDescriptor;

export type RenderedSectionDescriptor = any; /* {
  message: Object,
  data: ItemDescriptor[],
} */

export type DraftState = {
  [narrow: string]: string,
};

export type TimingItemType = {
  text: string,
  startMs: number,
  endMs: number,
};

export type ActionSheetButtonType = any; /* {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
  onlyIf?: (props: AuthMessageAndNarrow) => boolean,
} */

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

export type ResponseExtractionFunc = any;

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

export type UnreadStreamData = {
  key: string,
  streamName: string,
  isMuted: boolean,
  isPrivate: boolean,
  isPinned: boolean,
  color: string,
  unread: number,
  data: Object[],
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
