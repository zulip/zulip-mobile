/* @flow */
import type { Action } from './actionTypes';

export type { ChildrenArray } from 'react';

export type AnimatedValue = any; // { AnimatedValue } from 'react-native';
export type MapStateToProps = any; // { MapStateToProps } from 'react-redux';

export type * from './actionTypes';

export type StyleObj = any;
export type Dispatch = any;
// export type { Dispatch } from 'redux';

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

export type Message = {
  avatar_url: string,
  client: 'website' | 'ZulipMobile',
  content: string,
  content_type: 'text/html' | 'text/markdown',
  display_recipient: any,
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

export type User = any; /* {
  avatarUrl: string,
  email: string,
  fullName: string,
  id: number,
  isActive: boolean,
  isAdmin: boolean,
  isBot: boolean,
} */

export type Presence = {
  pushable: boolean,
  aggregated: {
    client: string,
    status: UserStatus,
    timestamp: number,
  },
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

export type ClientPresence = {
  [key: string]: Presence,
};

export type Presences = {
  [key: string]: ClientPresence,
};

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
  presence: any,
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

export type Recipient = {
  display_recipient: string,
  subject: string,
  email: string,
  id: number,
};

export type ApiResponse = {
  result: string,
  msg: string,
};

export type EditMessage = {
  id: number,
  content: string,
  topic: string,
};

export type AuthenticationMethods = {
  dev: boolean,
  email: boolean,
  github: boolean,
  google: boolean,
  ldap: boolean,
  password: boolean,
};
export type ServerSettings = {
  authentication_methods: AuthenticationMethods,
  realm_icon: string,
  realm_name: string,
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
  orientation: 'LANDSCAPE' | 'PORTRAIT',
  outboxSending: boolean,
  safeAreaInsets: Dimensions,
  debug: Debug,
};

export type CaughtUpState = Object;

export type FetchingState = Object;

export type FlagsState = any; /* {
  read: Object,
  starred: Object,
  collapsed: Object,
  mentions: Object,
  wildcard_mentions: Object,
  summarize_in_home: Object,
  summarize_in_stream: Object,
  force_expand: Object,
  force_collapse: Object,
  has_alert_word: Object,
  historical: Object,
  is_me_message: Object,
} */

export type LoadingState = {
  presence: boolean,
  subscriptions: boolean,
  streams: boolean,
  unread: boolean,
  users: boolean,
};

export type MuteTuple = [string, string];
export type MuteState = any; // MuteTuple[]

export type NavigationState = {
  index: number,
  key: string,
  routes: Array<any> /* <{
    key: string,
    title: string,
  }>, */,
};

export type RealmFilter = [string, string, number];

export type RealmState = {
  twentyFourHourTime: boolean,
  pushToken: {
    token: string,
    msg: string,
    result: string,
  },
  filters: RealmFilter[],
  emoji: Object,
};

export type TopicDetails = any; /* {
  name: string,
  max_id: number,
} */

export type TopicsState = any; // TopicDetails[];

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

export type StreamsState = any; // [];

export type SubscriptionsState = any; // [];

export type TypingState = Object;

export type StreamUnreadItem = {
  stream_id: string,
  topic: string,
  unread_message_ids: number[],
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

export type UnreadStreamsState = StreamUnreadItem[];
export type UnreadHuddlesState = Object[];
export type UnreadPmsState = Object[];
export type UnreadMentionsState = number[];

export type AlertWordsState = any;
export type DraftsState = any;
export type UsersState = any; // [];
export type PresenceState = any;
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

export type RealmEmojiState = any;

export type RealmEmojiType = {
  author: {
    email: string,
    full_name: string,
    id: number,
  },
  deactivated: boolean,
  source_url: string,
};

export type LocalizableText = any; // string | { text: string, values: Object };

export type Subscription = {
  audible_notifications: boolean,
  color: string,
  description: string,
  desktop_notifications: boolean,
  email_address: string,
  in_home_view: boolean,
  invite_only: boolean,
  name: string,
  pin_to_top: boolean,
  push_notifications: boolean,
  stream_id: number,
  is_old_stream: boolean,
  push_notifications: boolean,
  stream_weekly_traffic: number,
};

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

export type DraftState = any; // { string: string };

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

export type Orientation = 'PORTRAIT' | 'LANDSCAPE';

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

export type PresenceAggregated = {
  client: string,
  status: string,
  timestamp: number,
};

export type Notification = {
  alert: string,
  content: string,
  content_truncated: boolean,
  event: 'message',
  'google.message_id': string,
  'google.sent_time': string,
  'google.ttl': number,
  realm_id: number,
  recipient_type: 'private' | 'stream',
  sender_avatar_url: string,
  sender_id: number,
  sender_email: string,
  sender_full_name: string,
  server: string,
  stream: string,
  topic: string,
  time: number,
  user: string,
  zulip_message_id: string,
};

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
  presences: Presence[],
  queue_id: string,
  realm_emoji: Object, // map of RealmEmojiType
  realm_filters: RealmFilter[],
  realm_name_in_notifications: boolean,
  realm_non_active_users: User[],
  realm_users: User[],
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
