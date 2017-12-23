/* @noflow */
export type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
export type { ChildrenArray } from 'react';
export type { Dispatch } from 'redux';
export type { AnimatedValue } from 'react-native';
export type { MapStateToProps } from 'react-redux';

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

export type ImageResource = {
  uri: string,
};

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

export type MessageState = {
  [narrow: string]: Message[],
};

type CascadingStylesClasses =
  | 'blockquote'
  | 'p'
  | 'span'
  | 'li'
  | 'math'
  | 'mrow'
  | 'msup'
  | 'mfrac';
type CascadingStylesTextClasses = 'a' | 'b' | 'strong' | 'th' | 'i' | 'em' | 'del' | 'code' | 'pre';
type StylesClasses =
  | 'ul'
  | 'ol'
  | 'li'
  | 'div'
  | 'p'
  | 'br'
  | 'span'
  | 'bullet'
  | 'a'
  | 'b'
  | 'i'
  | 'user-mention'
  | 'user-mention-me'
  | 'highlight'
  | 'code'
  | 'pre'
  | 'table'
  | 'thread'
  | 'tbody'
  | 'tr'
  | 'th'
  | 'td'
  | 'blockquote'
  | 'emoji'
  | 'common';
export type SupportedHtmlClasses =
  | CascadingStylesClasses
  | CascadingStylesTextClasses
  | StylesClasses;

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

export type EditMessage = {
  id: number,
  content: string,
};

export type Action = Object;

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
};

export type Actions = {
  appOnline: (isOnline: boolean) => Action,
  addToOutbox: (
    type: 'private' | 'stream',
    to: string | string[],
    subject: string,
    content: string,
  ) => Action,
  appState: (isActive: boolean) => Action,
  appOrientation: (orientation: string) => Action,
  sendFocusPing: (hasFocus: boolean, newUserInput: boolean) => Action,
  initUsers: (users: User[]) => Action,
  fetchUsers: () => Action,
  initialFetchComplete: () => Action,
  fetchEssentialInitialData: () => Action,
  fetchRestOfInitialData: (pushToken: string) => Action,
  deleteTokenPush: () => Action,
  deleteOutboxMessage: () => Action,
  saveTokenPush: (pushToken: string, result: string, msg: string) => Action,
  fetchEvents: () => Action,
  initNotifications: () => Action,
  switchAccount: (index: number) => Action,
  realmAdd: (realm: string) => Action,
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
  navigateToAuth: (serverSettings: ServerSettings) => Action,
  navigateToAccountPicker: () => Action,
  navigateToAccountDetails: (email: string) => Action,
  navigateToGroupDetails: (recipients: UserType) => Action,
  navigateToAddNewAccount: () => Action,
  navigateToLightbox: (realm: string) => Action,
  navigateToCreateGroup: () => Action,
  navigateToDiagnostics: () => Action,
  switchNarrow: (narrow: Narrow) => Action,
  doNarrow: (newNarrow: Narrow, anchor?: number) => Action,
  messageFetchStart: (narrow: Narrow, fetching: Object) => Action,
  messageFetchComplete: (
    messages: any[],
    narrow: Narrow,
    numBefore: number,
    numAfter: number,
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
  markMessagesRead: (messageIds: number[]) => Action,
  fetchOlder: () => Action,
  fetchNewer: () => Action,
};

export type AccountState = Account[];

export type AppState = {
  lastActivityTime: Date,
  isOnline: boolean,
  isActive: boolean,
  needsInitialFetch: boolean,
  eventQueueId: number,
  editMessage: ?EditMessage,
  outboxSending: boolean,
};

export type ChatState = {
  narrow: Narrow,
  messages: Object,
};

export type CaughtUpState = Object;

export type FetchingState = Object;

export type FlagsState = {
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
};

export type MuteTuple = [string, string];
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
  pushToken: {
    token: '',
    msg: '',
    result: '',
  },
};

export type TopicDetails = {
  name: string,
  max_id: number,
};

export type TopicsState = TopicDetails[];

export type ThemeType = 'default' | 'night';

export type StatusBarStyle = 'light-content' | 'dark-content';

export type SettingsState = {
  locale: string,
  theme: ThemeType,
};

export type StreamsState = [];

export type SubscriptionsState = [];

export type TypingState = Object;

export type UnreadState = {
  streams: Object[],
  huddles: Object[],
  pms: Object[],
  mentions: number[],
};

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
  unread: UnreadState,
  users: UsersState,
};

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

export type Outbox = {
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
};

export type OutboxState = Outbox[];

export type RenderedTimeDescriptor = {
  type: 'time',
  timestamp: number,
};

export type RenderedMessageDescriptor = {
  type: 'message',
  message: Object,
};

export type RenderedItemDescriptor = MessageDescriptor | TimeDescriptor;

export type RenderedSectionDescriptor = {
  message: Object,
  data: ItemDescriptor[],
};

export type DraftState = { string: string };

export type TimingItem = {
  text: string,
  start: Date,
  end: Date,
};

export type Reducer = (state: GlobalState, action: Action) => GlobalState;

export type ActionSheetButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
  onlyIf?: (props: AuthMessageAndNarrow) => boolean,
};

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
