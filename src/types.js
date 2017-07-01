export type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

export type Auth = {
  realm: string,
  apiKey: string,
  email: string,
};

export type Message = {
  avatar_url: string,
  client: 'website' | '???',
  content: string,
  content_type: 'text/html' | 'text/markdown',
  display_recipient: string,
  flags: [],
  gravatar_hash: string,
  id: number,
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

export type UserType = {
  email: string,
  fullName: string,
  avatarUrl: string,
};

export type UserStatus = 'active' | 'inactive' | 'offline';

export type User = {
  avatarUrl: string,
  email: string,
  fullName: string,
  id: number,
  isActive: boolean,
  isAdmin: boolean,
  isBot: boolean,
};

export type Presence = {
  client: string,
  pushable: boolean,
  status: UserStatus,
  timestamp: number,
};

export type ClientPresence = {
  [key: string]: Presence,
};

export type Presences = {
  [key: string]: ClientPresence,
};

export type Backend = 'dev' | 'google' | 'password';

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

export type NarrowOperator = 'is' | 'in' | 'near' | 'id' | 'stream' | 'topic' | 'sender' | 'pm-with';

export type NarrowElement = {
  operand: string,
  operator: NarrowOperator,
};

export type Narrow = NarrowElement[];

export type Recipient = {
  display_recipient: string,
  subject: string,
  email: string,
};

export type ApiResponse = {
  result: string,
  msg: string,
};

export type ResponseExtractionFunc = (ApiResponse) => any;

export type PropsAction = (string) => void;

export type PushRouteAction = PropsAction;

export type DoNarrowAction = PropsAction;

export type OnNarrowAction = PropsAction;

export type PopRouteAction = PropsAction;

export type InitRouteAction = PropsAction;

export type SetAuthType = PropsAction;

export type AccountState = [];

export type AppState = {
  lastActivityTime: Date,
  isHydrated: boolean,
  isOnline: boolean,
  isActive: boolean,
  needsInitialFetch: boolean,
  pushToken: string,
  eventQueueId: number,
};

export type ChatState = {
  fetching: { older: boolean, newer: boolean, },
  caughtUp: { older: boolean, newer: boolean, },
  narrow: Narrow,
  messages: MapOfMessages,
};

export type FlagsState = {
  read: Object,
  starred: Object,
  collapsed: Object,
  mentioned: Object,
  wildcard_mentioned: Object,
  summarize_in_home: Object,
  summarize_in_stream: Object,
  force_expand: Object,
  force_collapse: Object,
  has_alert_word: Object,
  historical: Object,
  is_me_message: Object,
};

export type MuteTuple = string[];
export type MuteState = MuteTuple[];

export type NavigationState = {
  index: number,
  key: string,
  routes: Array<{
    key: string,
    title: string,
  }>,
};

export type RealmState = {
  twentyFourHourTime: boolean,
  pushToken: string,
};

export type SettingsState = {
  locale: string,
  theme: string,
};

export type StreamsState = [];

export type SubscriptionsState = [];

export type TypingState = Object;

export type UsersState = [];

export type GlobalState = {
  accounts: AccountState,
  app: AppState,
  chat: ChatState,
  flags: FlagsState,
  mute: MuteState,
  nav: NavigationState,
  realm: RealmState,
  settings: SettingsState,
  streams: StreamsState,
  subscriptions: SubscriptionsState,
  typing: TypingState,
  users: UsersState,
};

export type Action = {
  type: string,
  apiKey: string,
  isOnline: boolean,
  isActive: boolean,
  orientation: string,
  payload: GlobalState,
};

export type MatchResult = Array<string> & { index: number, input: string, };

export type Dispatch = (action: Action) => void;

export type GetState = () => GlobalState;

export type ReactionType = {
  emoji_name: string,
  name: string,
  count: number,
  selfReacted: boolean,
};

export type LocalizableText = string | { text: string, values: Object, };
