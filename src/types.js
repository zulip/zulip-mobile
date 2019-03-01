/* @flow strict-local */
import type { IntlShape } from 'react-intl';
import type { InputSelector } from 'reselect';
import type { DangerouslyImpreciseStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { Action, NavigateAction } from './actionTypes';
import type {
  Auth,
  Topic,
  HuddlesUnreadItem,
  Message,
  MuteTuple,
  PmsUnreadItem,
  Reaction,
  RealmBot,
  RealmEmojiState,
  RealmFilter,
  Narrow,
  Stream,
  StreamUnreadItem,
  Subscription,
  User,
  UserGroup,
  UserPresence,
  UserStatusMapObject,
} from './api/apiTypes';
import type { AppStyles } from './styles/theme';

import type { SessionState } from './session/sessionReducers';

export type * from './actionTypes';
export type * from './api/apiTypes';

/*
 * TODO as the name suggests, this should be broken down more specifically.
 * Each use should be one of ViewStyleProp, TextStyleProp, ImageStyleProp.
 */
export type Style = DangerouslyImpreciseStyleProp;

export type Orientation = 'LANDSCAPE' | 'PORTRAIT';

export type Dimensions = {|
  bottom: number,
  left: number,
  right: number,
  top: number,
|};

export type InputSelectionType = {|
  start: number,
  end: number,
|};

/**
 * An `Identity`, a secret, and some other per-identity information.
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
export type Account = {|
  ...Auth,

  /**
   * The last device token value the server has definitely heard from us.
   *
   * This is `null` until we make a successful request to the server to
   * tell it the token.
   *
   * See the `pushToken` property in `SessionState`, and docs linked there.
   */
  ackedPushToken: string | null,
|};

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
export type AggregatedReaction = {|
  code: string,
  count: number,
  name: string,
  selfReacted: boolean,
  type: string,
|};

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
export type MessagesState = {|
  [id: number]: $Exact<Message>,
|};

export type UserStatusState = UserStatusMapObject;

/**
 * Info about how complete our knowledge is of the messages in some narrow.
 *
 * @prop older - true just if in some fetch we reached the oldest message
 *   in the narrow.  No need to fetch more in that direction.
 * @prop newer - true just if in some fetch we reached the newest message in
 *   the narrow.  Of course their may always be new messages, but we should
 *   learn about them through events; so again, no need to fetch more.
 */
export type CaughtUp = {|
  older: boolean,
  newer: boolean,
|};

export type Fetching = {|
  older: boolean,
  newer: boolean,
|};

export type StreamsState = Stream[];

export type SubscriptionsState = Subscription[];

export type EditMessage = {|
  id: number,
  content: string,
  topic: string,
|};

export type AccountsState = Account[];

export type Debug = {|
  highlightUnreadMessages: boolean,
  doNotMarkMessagesAsRead: boolean,
|};

/**
 * Info about how completely we know the messages in each narrow of
 * MessagesState.
 */
export type CaughtUpState = {|
  [narrow: string]: CaughtUp,
|};

export type FetchingState = {
  [narrow: string]: Fetching,
};

export type FlagsState = {|
  read: { [messageId: number]: boolean },
  starred: { [messageId: number]: boolean },
  collapsed: { [messageId: number]: boolean },
  mentions: { [messageId: number]: boolean },
  wildcard_mentions: { [messageId: number]: boolean },
  summarize_in_home: { [messageId: number]: boolean },
  summarize_in_stream: { [messageId: number]: boolean },
  force_expand: { [messageId: number]: boolean },
  force_collapse: { [messageId: number]: boolean },
  has_alert_word: { [messageId: number]: boolean },
  historical: { [messageId: number]: boolean },
  is_me_message: { [messageId: number]: boolean },
|};

export type FlagName = $Keys<FlagsState>;

export type MigrationsState = {|
  version?: string,
|};

export type LoadingState = {|
  presence: boolean,
  subscriptions: boolean,
  streams: boolean,
  unread: boolean,
  users: boolean,
|};

export type MuteState = MuteTuple[];

export type NavigationRouteState = {
  key: string,
  routeName: string,
  /** The fields in `params` vary by route; see `navActions.js`. */
  params?: {
    narrow?: Narrow,
  },
};

export type NavigationState = {|
  index: number,
  isTransitioning: boolean,
  key: string,
  routes: NavigationRouteState[],
|};

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
 * @prop filters
 * @prop emoji
 * @prop isAdmin
 */
export type RealmState = {|
  twentyFourHourTime: boolean,
  canCreateStreams: boolean,
  crossRealmBots: RealmBot[],
  nonActiveUsers: User[],
  filters: RealmFilter[],
  emoji: RealmEmojiState,
  isAdmin: boolean,
|};

export type TopicExtended = {|
  ...$Exact<Topic>,
  isMuted: boolean,
  unreadCount: number,
|};

export type TopicsState = {|
  [number]: Topic[],
|};

export type ThemeName = 'default' | 'night';

export type Context = {|
  styles: AppStyles,
|};

export type SettingsState = {|
  locale: string,
  theme: ThemeName,
  offlineNotification: boolean,
  onlineNotification: boolean,
  experimentalFeaturesEnabled: boolean,
  streamNotification: boolean,
|};

export type TypingState = {|
  [normalizedRecipients: string]: {
    time: number,
    userIds: number[],
  },
|};

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
  avatar_url: string | null,
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

export type UnreadStreamsState = StreamUnreadItem[];
export type UnreadHuddlesState = HuddlesUnreadItem[];
export type UnreadPmsState = PmsUnreadItem[];
export type UnreadMentionsState = number[];

export type AlertWordsState = string[];

export type DraftsState = {|
  [narrow: string]: string,
|};

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
export type PresenceState = {|
  [email: string]: UserPresence,
|};

export type OutboxState = Outbox[];

export type UnreadState = {|
  streams: UnreadStreamsState,
  huddles: UnreadHuddlesState,
  pms: UnreadPmsState,
  mentions: UnreadMentionsState,
|};

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
  userStatus: UserStatusState,
  users: UsersState,
|};

/** A selector returning TResult, with extra parameter TParam. */
// Seems like this should be OutputSelector... but for whatever reason,
// putting that on a selector doesn't cause the result type to propagate to
// the corresponding parameter when used in `createSelector`, and this does.
export type Selector<TResult, TParam = void> = InputSelector<GlobalState, TParam, TResult>;

export type GetState = () => GlobalState;

export type PlainDispatch = <A: Action | NavigateAction>(action: A) => A;

export interface Dispatch {
  <A: Action | NavigateAction>(action: A): A;
  <T>((Dispatch, GetState) => T): T;
}

export type LocalizableText = string | { text: string, values?: { [string]: string } };

/**
 * Usually called `_`, and invoked like `_('Message')` -> `'Nachricht'`.
 *
 * To use, put these two lines at the top of a React component's body:
 *
 *     static contextType = TranslationContext;
 *     context: GetText;
 *
 * and then in methods, say `const _ = this.context`.
 *
 * Alternatively, for when `context` is already in use: use `withGetText`
 * and then say `const { _ } = this.props`.
 *
 * @prop intl - The full react-intl API, for more complex situations.
 */
export type GetText = {
  (string): string,
  intl: IntlShape,
};

export type UnreadStreamItem = {|
  key: string,
  streamName: string,
  unread: number,
  color: string,
  isMuted: boolean,
  isPinned: boolean,
  isPrivate: boolean,
  data: Array<{|
    key: string,
    topic: string,
    unread: number,
    isMuted: boolean,
    lastUnreadMsgId: number,
  |}>,
|};

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

export type DraftState = {|
  [narrow: string]: string,
|};

export type TimingItemType = {|
  text: string,
  startMs: number,
  endMs: number,
|};

export type UnreadTopic = {|
  isMuted: boolean,
  key: string,
  topic: string,
  unread: number,
|};

export type UnreadStream = {|
  color: string,
  data: UnreadTopic[],
  isMuted: boolean,
  isPrivate: boolean,
  key: string,
  streamName: string,
  unread: number,
|};

export type NotificationCommon = {|
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
|};

export type NotificationPrivate = {|
  ...$Exact<NotificationCommon>,
  recipient_type: 'private',
|};

export type NotificationGroup = {|
  ...$Exact<NotificationCommon>,
  pm_users: string, // comma separated ids
  recipient_type: 'private',
|};

export type NotificationStream = {|
  ...$Exact<NotificationCommon>,
  recipient_type: 'stream',
  stream: string,
  topic: string,
|};

export type Notification = NotificationPrivate | NotificationGroup | NotificationStream;

export type NamedUser = {|
  id: number,
  email: string,
  full_name: string,
|};

export type TabNavigationOptionsPropsType = {|
  isFocussed: boolean,
  tintColor: string,
|};

/**
 * Summary of a PM conversation (either 1:1 or group PMs).
 */
export type PmConversationData = {|
  ids: string,
  msgId: number,
  recipients: string,
  timestamp: number,
  unread: number,
|};
