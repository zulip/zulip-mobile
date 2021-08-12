/**
 * Types for events returned by the server.
 *
 * See server docs:
 *   https://zulip.com/api/real-time-events
 *   https://zulip.readthedocs.io/en/latest/subsystems/events-system.html
 *
 * NB this is just a start -- far from complete.
 *
 * @flow strict-local
 */

import type { Message, MutedUser, Stream, UserId, UserPresence } from './modelTypes';

export class EventTypes {
  static alert_words: 'alert_words' = 'alert_words';
  static delete_message: 'delete_message' = 'delete_message';
  static heartbeat: 'heartbeat' = 'heartbeat';
  static message: 'message' = 'message';
  static muted_topics: 'muted_topics' = 'muted_topics';
  static muted_users: 'muted_users' = 'muted_users';
  static presence: 'presence' = 'presence';
  static reaction: 'reaction' = 'reaction';
  static realm_bot: 'realm_bot' = 'realm_bot';
  static realm_emoji: 'realm_emoji' = 'realm_emoji';
  static realm_filters: 'realm_filters' = 'realm_filters';
  static realm_user: 'realm_user' = 'realm_user';
  static restart: 'restart' = 'restart';
  static stream: 'stream' = 'stream';
  static submessage: 'submessage' = 'submessage';
  static subscription: 'subscription' = 'subscription';
  static typing: 'typing' = 'typing';
  static update_display_settings: 'update_display_settings' = 'update_display_settings';
  static update_global_notifications: 'update_global_notifications' = 'update_global_notifications';
  static update_message: 'update_message' = 'update_message';
  static update_message_flags: 'update_message_flags' = 'update_message_flags';
  static user_group: 'user_group' = 'user_group';
  static user_status: 'user_status' = 'user_status';
}

type EventCommon = $ReadOnly<{|
  id: number,
|}>;

/** A common supertype of all events, known or unknown. */
export type GeneralEvent = $ReadOnly<{
  ...EventCommon,
  type: string,
  // Note this is an inexact object type!  There will be more properties.
  ...
}>;

export type HeartbeatEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.heartbeat,
|}>;

export type MessageEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.message,
  message: Message,

  /** See the same-named property on `Message`. */
  flags?: $ReadOnlyArray<string>,

  /**
   * When the message was sent by this client (with `queue_id` this queue),
   * matches `local_id` from send.
   *
   * Otherwise absent.
   */
  local_message_id?: number,
|}>;

export type MutedUsersEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.muted_users,
  muted_users: $ReadOnlyArray<MutedUser>,
|}>;

/** A new submessage.  See the `Submessage` type for details. */
export type SubmessageEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.submessage,
  submessage_id: number,
  message_id: number,
  sender_id: UserId,
  msg_type: 'widget',
  content: string,
|}>;

export type PresenceEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.presence,
  email: string,
  server_timestamp: number,
  presence: UserPresence,
|}>;

/**
 * Updates the user status for a user
 *
 * @prop [away] - update user's away status:
 *       - `true` the user is away regardless of presence
 *       - `false` remove the away status, now use presence
 * @prop [status_text] - if present:
 *       - empty string clears the user's status text
 *       - any string sets user's status to that
 *
 * Not providing a property means 'leave this value unchanged'
 */
export type UserStatusEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.user_status,
  user_id: UserId,
  away?: boolean,
  status_text?: string,
|}>;

type StreamListEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.stream,
  streams: $ReadOnlyArray<Stream>,
|}>;

// prettier-ignore
export type StreamEvent =
  | {| ...StreamListEvent, op: 'create', |}
  | {| ...StreamListEvent, op: 'delete', |}
  | {| ...StreamListEvent, op: 'occupy', |}
  | {| ...StreamListEvent, op: 'vacate', |}
  | {|
      ...EventCommon,
      type: typeof EventTypes.stream,
      op: 'update',
      stream_id: number,
      name: string,
      property: string,
      value: string,
    |};

export type UpdateMessageFlagsEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.update_message_flags,

  // Servers with feature level 32+ send `op`. Servers will eventually
  // stop sending `operation`; see #4238.
  operation?: 'add' | 'remove',
  op?: 'add' | 'remove',

  flag: empty, // TODO fill in
  all: boolean,
  messages: $ReadOnlyArray<number>,
|}>;

// https://zulip.com/api/get-events#restart
export type RestartEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.restart,

  server_generation: number,
  immediate: boolean,

  // Servers at feature level 59 or above send these
  // (zulip/zulip@65c400e06). The fields describe the server after the
  // ugprade; handling an event that includes them is the fastest way
  // to learn about a server upgrade.
  //
  // They have the same shape and meaning as the same-named fields in
  // the /server_settings and /register responses.
  zulip_version?: string,
  zulip_feature_level?: number,
|}>;
