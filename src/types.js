/* @flow */
import type { Action } from './actionTypes';

export type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
export type { ChildrenArray } from 'react';
export type AnimatedValue = any; // { AnimatedValue } from 'react-native';
export type MapStateToProps = any; // { MapStateToProps } from 'react-redux';

export type * from './actionTypes';

export type Dispatch = any;
// export type { Dispatch } from 'redux';

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

export type UserStatus = 'active' | 'inactive' | 'offline';

export type User = any; /* {
  avatarUrl: string,
  email: string,
  fullName: string,
  id: number,
  isActive: boolean,
  isAdmin: boolean,
  isBot: boolean,
} */

export type Presence = any; /* {
  client: string,
  pushable: boolean,
  status: UserStatus,
  timestamp: number,
} */

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

export type Recipient = any; /* {
  display_recipient: string,
  subject: string,
  email: string,
} */

export type ApiResponse = {
  result: string,
  msg: string,
};

export type EditMessage = any; /* {
  id: number,
  content: string,
} */

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

export type SessionState = {
  composeTools: boolean,
  eventQueueId: ?number,
  editMessage: ?EditMessage,
  lastActivityTime: Date,
  isOnline: boolean,
  isActive: boolean,
  isHydrated: boolean,
  lastActivityTime: Date,
  needsInitialFetch: boolean,
  orientation: 'LANDSCAPE' | 'PORTRAIT',
  outboxSending: boolean,
  safeAreaInsets: {
    bottom: number,
    left: number,
    right: number,
    top: number,
  },
  debug: {
    highlightUnreadMessages: boolean,
    doNotMarkMessagesAsRead: boolean,
  },
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
export type MuteState = any; // MuteTuple[];

export type NavigationState = {
  index: number,
  key: string,
  routes: Array<any> /* <{
    key: string,
    title: string,
  }>, */,
};

export type RealmState = any; /* {
  twentyFourHourTime: boolean,
  pushToken: {
    token: '',
    msg: '',
    result: '',
  },
} */

export type TopicDetails = any; /* {
  name: string,
  max_id: number,
} */

export type TopicsState = any; // TopicDetails[];

export type ThemeType = 'default' | 'night';

export type StatusBarStyle = 'light-content' | 'dark-content';

export type SettingsState = any; /* {
  locale: string,
  theme: ThemeType,
} */

export type StreamsState = any; // [];

export type SubscriptionsState = any; // [];

export type TypingState = Object;

export type StreamUnreadItem = {
  stream_id: string,
  topic: string,
  unread_message_ids: number[],
};

export type UnreadStreamsState = StreamUnreadItem[];
export type UnreadHuddlesState = Object[];
export type UnreadPmsState = Object[];
export type UnreadMentionsState = number[];

export type UsersState = any; // [];

export type GlobalState = any; /* {
  accounts: AccountState,
  session: SessionState,
  chat: ChatState,
  flags: FlagsState,
  loading: LoadingState,
  mute: MuteState,
  nav: NavigationState,
  realm: RealmState,
  settings: SettingsState,
  streams: StreamsState,
  subscriptions: SubscriptionsState,
  typing: TypingState,
  unread: UnreadState,
  users: UsersState,
} */

export type MatchResult = Array<string> & { index: number, input: string };

export type GetState = () => GlobalState;

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

export type DomElement = any; /* {
  name: string,
  type: string,
  attribs: Object,
  next: DomElement,
  parent: DomElement,
  prev: DomElement,
  children: DomElement[],
} */

export type Subscription = any; /* {
  audible_notifications: boolean,
  color: string,
  description: string,
  desktop_notifications: boolean,
  email_address: string,
  in_home_view: boolean,
  invite_only: boolean,
  name: string,
  pin_to_top: boolean,
  stream_id: number,
} */

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

export type OutboxState = Outbox[];

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

export type TimingItem = any; /* {
  text: string,
  start: Date,
  end: Date,
} */

export type Reducer = (state: GlobalState, action: Action) => GlobalState;

export type ActionSheetButtonType = any; /* {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
  onlyIf?: (props: AuthMessageAndNarrow) => boolean,
} */

export type Dimensions = {
  bottom: number,
  left: number,
  right: number,
  top: number,
};

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

export type Notification = any; /* {
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
  time: number,
  user: string,
  zulip_message_id: string,
} */

export type NamedUser = {
  id: number,
  email: string,
  full_name: string,
};

export type UserType = any;
export type RealmEmoji = any;
export type ResponseExtractionFunc = any;
export type AuthGetStringAndMessageType = any;
export type PresenceState = any;

export type TabNavigationOptionsPropsType = {
  isFocussed: boolean,
  tintColor: string,
};
