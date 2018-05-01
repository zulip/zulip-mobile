/* @flow */
import type { Action } from './actionTypes';
import type { ApiUser } from './api/apiTypes';

export type { ChildrenArray } from 'react';

export type AnimatedValue = any; // { AnimatedValue } from 'react-native';
export type MapStateToProps = any; // { MapStateToProps } from 'react-redux';

export type * from './actionTypes';
export type * from './api/apiTypes';

export type StyleObj = any;
export type Dispatch = any;
// export type { Dispatch } from 'redux';

export type Orientation = 'LANDSCAPE' | 'PORTRAIT';

export type Dimensions = {
  bottom: number,
  left: number,
  right: number,
  top: number,
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

export type ImageResource = any; /* {
  uri: string,
} */

export type ReactionType = any; /* {
  emoji_name: string,
  user: any,
  name: string,
  count: number,
  selfReacted: boolean,
}; */

export type Recipient = any; /* {
   email: string,
   full_name: string,
   id: number,
   is_mirror_dummy: boolean,
   short_name: string,
 }; */

export type Message = {
  avatar_url: ?string,
  client: 'website' | 'ZulipMobile',
  content: string,
  content_type: 'text/html' | 'text/markdown',
  display_recipient: any, // string | Recipient[],
  edit_history: any[],
  flags: [],
  gravatar_hash: string,
  id: number,
  isOutbox: boolean,
  match_content?: string,
  match_subject?: string,
  reactions: ReactionType[],
  recipient_id: number,
  sender_domain: string,
  sender_email: string,
  sender_full_name: string,
  sender_id: number,
  sender_short_name: string,
  subject: string,
  subject_links: [],
  timestamp: number,
  type: 'stream' | 'private',
};

export type MessageState = {
  [narrow: string]: Message[],
};

export type UserStatus = 'active' | 'idle' | 'offline';

export type User = {
  avatarUrl: string,
  email: string,
  fullName: string,
  id: number,
  isActive: boolean,
  isAdmin: boolean,
  isBot: boolean,
};

export type PresenceAggregated = {
  client: string,
  status: UserStatus,
  timestamp: number,
};

export type ClientPresence = {
  status: UserStatus,
  timestamp: number,
  client: string,
  pushable: boolean,
};

export type Presence = {
  aggregated: PresenceAggregated,
  [client: string]: ClientPresence,
};

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
  in_home_view: boolean,
  pin_to_top: boolean,
  color: string,
};

export type StreamsState = Stream[];

export type Subscription = Stream & {
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

export type ApiResponse = {
  result: string,
  msg: string,
};

export type EditMessage = {
  id: number,
  content: string,
  topic: string,
};

export type AccountState = Account[];

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
};

export type RealmEmojiState = {
  [id: string]: RealmEmojiType,
};

export type RealmState = {
  twentyFourHourTime: boolean,
  canCreateStreams: boolean,
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

export type TopicsState = {
  [number]: Topic[],
};

export type ThemeType = 'default' | 'night';

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

export type Outbox = any; /* {
  content: string,
  markdownContent: string,
  timestamp: number,
  id: number,
  sender_full_name: string,
  email: string,
  avatar_url: string,
  type: 'stream' | 'private',
  outbox: true,
  narrow: Narrow,
} */

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

export type UsersState = User[];

export type PresenceState = {
  [email: string]: Presence,
};

export type OutboxState = Outbox[];

export type GlobalState = {
  accounts: AccountState,
  alertWords: AlertWordsState,
  caughtUp: CaughtUpState,
  drafts: DraftsState,
  fetching: FetchingState,
  flags: FlagsState,
  loading: LoadingState,
  messages: MessageState,
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
  unread: {
    streams: UnreadStreamsState,
    huddles: UnreadHuddlesState,
    pms: UnreadPmsState,
    mentions: UnreadMentionsState,
  },
  users: UsersState,
};

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
  start: number,
  end: number,
};

export type Reducer = (state: GlobalState, action: Action) => GlobalState;

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

export type RealmEmoji = any;
export type ResponseExtractionFunc = any;
export type AuthGetStringAndMessageType = any;

export type TabNavigationOptionsPropsType = {
  isFocussed: boolean,
  tintColor: string,
};

export type RealmBot = {
  email: string,
  full_name: string,
  is_admin: boolean,
  is_bot: true,
  user_id: number,
};

export type NeverSubscribedStream = {
  description: string,
  invite_only: boolean,
  is_old_stream: boolean,
  name: string,
  stream_id: number,
};

export type InitialRealmData = {
  alert_words: string[],
  avatar_source: 'G',
  avatar_url: string,
  avatar_url_medium: string,
  can_create_streams: boolean,
  cross_realm_bots: RealmBot[],
  default_desktop_notifications: boolean,
  default_language: string,
  email: string,
  emojiset: string,
  emojiset_choices: Object,
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
  enter_sends: boolean,
  full_name: string,
  high_contrast_mode: boolean,
  is_admin: boolean,
  last_event_id: number,
  left_side_userlist: boolean,
  max_message_id: number,
  message_content_in_email_notifications: boolean,
  msg: string,
  muted_topics: MuteTuple[],
  never_subscribed: NeverSubscribedStream[],
  stream_weekly_traffic: number,
  night_mode: boolean,
  pm_content_in_desktop_notifications: boolean,
  presences: PresenceState,
  queue_id: number,
  realm_emoji: RealmEmojiState,
  realm_filters: RealmFilter[],
  realm_name_in_notifications: boolean,
  realm_non_active_users: ApiUser[],
  realm_users: ApiUser[],
  subscriptions: Subscription[],
  timezone: string,
  translate_emoticons: boolean,
  twenty_four_hour_time: boolean,
  unread_msgs: {
    streams: UnreadStreamsState,
    huddles: UnreadHuddlesState,
    count: number,
    pms: UnreadPmsState,
    mentions: UnreadMentionsState,
  },
  unsubscribed: Subscription[],
  user_id: number,
};
