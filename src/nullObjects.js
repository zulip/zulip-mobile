/* @flow strict-local */
import type { User, Subscription } from './types';

export const NULL_OBJECT = Object.freeze({});

export const NULL_ARRAY = Object.freeze([]);

/*
 * All the below objects are DEPRECATED; rather than using one, choose the
 * appropriate fallback behavior explicitly.  See 25125db94 for more
 * discussion, and 25125db94^..e22596c24 for a variety of examples of how.
 *
 * Further changes to eliminate the remaining uses of these would be great.
 */

/** DEPRECATED; don't add new uses.  See block comment above definition. */
export const NULL_USER: User = {
  avatar_url: '',
  email: '',
  full_name: '',
  is_admin: false,
  is_bot: false,
  timezone: '',
  user_id: -1,
};

/** DEPRECATED; don't add new uses.  See block comment above definition. */
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
  is_announcement_only: false,
  history_public_to_subscribers: false,
};
