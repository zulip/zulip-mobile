export type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

export type Auth = {
  realm: string,
  apiKey: string,
  email: string,
};

export type Account = Auth;

export type Message = {
  avatar_url: string,
  client: 'website' | 'ZulipMobile',
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

export type Fetching = {
  older: boolean,
  newer: boolean,
};

export type Stream = {
  stream_id: number,
  description: string,
  name: string,
  invite_only: boolean,
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

export type NarrowOperator =
  | 'is'
  | 'in'
  | 'near'
  | 'id'
  | 'stream'
  | 'topic'
  | 'sender'
  | 'pm-with';

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

export type Action = Object;

export type Actions = {
  appOnline: (isOnline: boolean) => Action,
  appState: (isActive: boolean) => Action,
  appOrientation: (orientation: string) => Action,
  sendFocusPing: (hasFocus: boolean, newUserInput: boolean) => Action,
  initUsers: (users: User[]) => Action,
  fetchUsers: () => Action,
  fetchUsersAndStatus: () => Action,
  initialFetchComplete: () => Action,
  fetchEssentialInitialData: () => Action,
  fetchRestOfInitialData: (pushToken: string) => Action,
  deleteTokenPush: () => Action,
  saveTokenPush: (pushToken: string) => Action,
  fetchEvents: () => Action,
  switchAccount: (index: number) => Action,
  realmAdd: (realm: string) => Action,
  setAuthType: (authType: string) => Action,
  removeAccount: (index: number) => Action,
  loginSuccess: (realm: string, email: string, apiKey: string) => Action,
  logout: () => Action,
  initStreams: (streams: any[]) => Action,
  fetchStreams: () => Action,
  cancelEditMessage: () => void,
  startEditMessage: (messageId: number) => void,
  resetNavigation: () => Action,
  navigateBack: () => Action,
  navigateToAllStreams: () => Action,
  navigateToUsersScreen: () => Action,
  navigateToSearch: () => Action,
  navigateToSettings: () => Action,
  navigateToAuth: (authType: string) => Action,
  navigateToAccountPicker: () => Action,
  navigateToAccountDetails: (email: string) => Action,
  navigateToAddNewAccount: (realm: string) => Action,
  navigateToLightbox: (realm: string) => Action,
  switchNarrow: (narrow: Narrow) => Action,
  doNarrow: (newNarrow: Narrow, anchor: number) => Action,
  messageFetchStart: (narrow: Narrow, fetching: Object) => Action,
  messageFetchSuccess: (
    messages: any[],
    narrow: Narrow,
    fetching?: Fetching,
    caughtUp?: Object,
  ) => Action,
  backgroundFetchMessages: (
    anchor: number,
    numBefore: number,
    numAfter: number,
    narrow: Narrow,
    useFirstUnread: boolean,
  ) => Action,
  fetchMessages: (
    anchor: number,
    numBefore: number,
    numAfter: number,
    narrow: Narrow,
    useFirstUnread: boolean,
  ) => Action,
  fetchMessagesAtFirstUnread: (narrow: Narrow) => Action,
  markMessagesRead: (messageIds: number[]) => Actions,
  fetchOlder: () => Action,
  fetchNewer: () => Action,
};

export type AccountState = Account[];

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
  fetching: Fetching,
  caughtUp: { older: boolean, newer: boolean },
  narrow: Narrow,
  messages: Object,
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

export type MatchResult = Array<string> & { index: number, input: string };

export type Dispatch = (action: Action) => void;

export type GetState = () => GlobalState;

export type ReactionType = {
  emoji_name: string,
  name: string,
  count: number,
  selfReacted: boolean,
};

export type LocalizableText = string | { text: string, values: Object };

export type DomElement = {
  name: string,
  type: string,
  attribs: Object,
  next: DomElement,
  parent: DomElement,
  prev: DomElement,
  children: DomElement[],
};

export type EditMessage = {
  id: number,
  content: string,
};

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
  stream_id: number,
};
