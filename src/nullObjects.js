/* @flow */
import type {
  Account,
  User,
  Stream,
  Message,
  Subscription,
  Presence,
  PresenceAggregated,
  CaughtUp,
  Fetching,
  NavigationState,
} from './types';

export const nullFunction = () => {};

export const NULL_OBJECT = Object.freeze({});

export const NULL_ARRAY = Object.freeze([]);

export const NULL_ACCOUNT: Account = {
  apiKey: '',
  email: '',
  realm: '',
};

export const NULL_USER: User = {
  avatarUrl: '',
  email: '',
  id: -1,
  isActive: false,
  isAdmin: false,
  isBot: false,
};

export const NULL_STREAM: Stream = {
  stream_id: 0,
  description: '',
  name: '',
  invite_only: true,
  in_home_view: false,
  pin_to_top: false,
  color: 'green',
};

export const NULL_MESSAGE: Message = {
  avatar_url: '',
  client: 'website',
  content: '',
  content_type: 'text/html',
  display_recipient: '',
  edit_history: [],
  flags: [],
  gravatar_hash: '',
  id: -1,
  isOutbox: false,
  reactions: [],
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
  in_home_view: false,
  invite_only: false,
  name: '',
  pin_to_top: false,
  stream_id: 0,
  stream_weekly_traffic: 0,
  push_notifications: false,
  is_old_stream: false,
};

export const NULL_PRESENCE: Presence = {
  email: '',
  age: 0,
  pushable: false,
  aggregated: {
    status: 'offline',
    timestamp: 0,
    client: '',
  },
};

export const NULL_PRESENCE_AGGREGATED: PresenceAggregated = {
  client: '',
  status: 'offline',
  timestamp: 0,
};

export const NULL_CAUGHTUP: CaughtUp = {
  older: false,
  newer: false,
};

export const NULL_FETCHING: Fetching = {
  older: false,
  newer: false,
};

export const NULL_NAV_STATE: NavigationState = {
  index: -1,
  isTransitioning: false,
  key: '',
  routes: [],
};
