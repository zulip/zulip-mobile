/* @flow */
import type {
  Account,
  User,
  Stream,
  Message,
  Subscription,
  Presence,
  CaughtUp,
  Fetching,
} from './types';

export const nullFunction = () => {};

export const NULL_ARRAY = Object.freeze([]);

export const NULL_ACCOUNT: Account = {
  apiKey: '',
  email: '',
  realm: '',
};

export const NULL_USER: User = {
  fullName: '',
  status: '',
  avatarUrl: '',
  email: '',
};

export const NULL_STREAM: Stream = {
  stream_id: 0,
  description: '',
  name: '',
  invite_only: true,
};

export const NULL_MESSAGE: Message = {
  avatar_url: '',
  client: 'website',
  content: '',
  content_type: 'text/html',
  display_recipient: '',
  flags: [],
  gravatar_hash: '',
  id: -1,
  recipient_id: -1,
  sender_domain: '',
  sender_email: '',
  sender_full_name: '',
  sender_id: -1,
  sender_short_name: '',
  subject: '',
  subject_links: [],
  timestamp: 0,
  type: 'stream',
};

export const NULL_SUBSCRIPTION: Subscription = {
  audible_notifications: false,
  color: 'gray',
  description: '',
  desktop_notifications: false,
  email_address: '',
  in_home_view: true,
  invite_only: false,
  name: '',
  pin_to_top: false,
  stream_id: 0,
};

export const NULL_PRESENCE: Presence = {
  email: '',
  status: undefined,
  timestamp: 0,
  age: 0,
};

export const NULL_CAUGHTUP: CaughtUp = {
  older: false,
  newer: false,
};

export const NULL_FETCHING: Fetching = {
  older: false,
  newer: false,
};
