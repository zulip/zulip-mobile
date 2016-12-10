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

export type UserStatus = 'active' | 'inactive' | 'offline';

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
