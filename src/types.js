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

export type NavigationState = {
  index: number,
  key: string,
  routes: Array<{
    key: string,
    title: string,
  }>,
};

export type StateType = {
  accounts: AccountState,
  nav: NavigationState,
};

export type Action = {
  type: string,
  apiKey: string,
  isOnline: boolean,
  isActive: boolean,
  orientation: string,
  payload: StateType,
};

export type MatchResult = Array<string> & { index: number, input: string, };

export type Dispatch = (action: Action) => void;

export type GetState = () => StateType;

export type ReactionType = {
  emoji_name: string,
  name: string,
  count: number,
  selfReacted: boolean,
};
