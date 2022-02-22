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

import type {
  Message,
  MutedUser,
  Stream,
  UserId,
  UserPresence,
  UserStatusUpdate,
} from './modelTypes';
import type { RealmDataForUpdate } from './realmDataTypes';

export class EventTypes {
  static alert_words: 'alert_words' = 'alert_words';
  static delete_message: 'delete_message' = 'delete_message';
  static heartbeat: 'heartbeat' = 'heartbeat';
  static message: 'message' = 'message';
  static muted_topics: 'muted_topics' = 'muted_topics';
  static muted_users: 'muted_users' = 'muted_users';
  static presence: 'presence' = 'presence';
  static reaction: 'reaction' = 'reaction';
  static realm: 'realm' = 'realm';
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
  op?: string,
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
 * New value for a user's chosen availability and/or text/emoji status
 *
 * https://zulip.com/api/get-events#user_status
 *
 * See InitialDataUserStatus for the corresponding initial data.
 */
export type UserStatusEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.user_status,
  user_id: UserId,

  // How the status is updated from the old value.
  ...UserStatusUpdate,
|}>;

type StreamListEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.stream,
  streams: $ReadOnlyArray<Stream>,
|}>;

// prettier-ignore
export type StreamEvent =
  | {| ...StreamListEvent, +op: 'create', |}
  | {| ...StreamListEvent, +op: 'delete', |}
  | {| ...StreamListEvent, +op: 'occupy', |}
  | {| ...StreamListEvent, +op: 'vacate', |}
  | $ReadOnly<{|
      ...EventCommon,
      type: typeof EventTypes.stream,
      op: 'update',
      stream_id: number,
      name: string,
      property: string,
      value: string,
    |}>;

export type UpdateMessageFlagsEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.update_message_flags,

  // Servers with feature level 32+ send `op`. Servers will eventually
  // stop sending `operation`; see #4238.
  // TODO(server-4.0): Simplify to just `op`.
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
  // TODO(server-4.0): Mark these as required.
  zulip_version?: string,
  zulip_feature_level?: number,
|}>;

// https://zulip.com/api/get-events#realm-update
// We get events of this shape from the server. But when we dispatch Redux
// actions for them, we construct the action so its shape matches the action
// we dispatch for RealmUpdateDictEvent events. That way we don't have to
// handle two different expressions of "a property has changed".
export type RealmUpdateEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.realm,

  op: 'update',

  // TODO(flow): `property` and `value` should correspond
  property: $Keys<RealmDataForUpdate>,
  value: $ElementType<RealmDataForUpdate, $Keys<RealmDataForUpdate>>,

  extra_data: { +upload_quota?: number, ... },
|}>;

// https://zulip.com/api/get-events#realm-update-dict
export type RealmUpdateDictEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.realm,

  op: 'update_dict',
  property: 'default',
  data: $Rest<RealmDataForUpdate, { ... }>,
|}>;

/** https://zulip.com/api/get-events#update_message */
// This is current to feature level 109.
export type UpdateMessageEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.update_message,

  // Future servers might send `null` here:
  //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/.60update_message.60.20event/near/1309241
  // TODO(server-5.0): Update this and/or simplify.
  user_id?: UserId | null,

  // Any content changes apply to just message_id.
  message_id: number,

  // Any stream/topic changes apply to all of message_ids, which is
  //   guaranteed to include message_id.
  message_ids: $ReadOnlyArray<number>,

  flags: $ReadOnlyArray<string>,
  edit_timestamp?: number,
  stream_name?: string,
  stream_id?: number,
  new_stream_id?: number,
  propagate_mode?: 'change_one' | 'change_later' | 'change_all',
  orig_subject?: string,
  subject?: string,

  // TODO(server-4.0): Changed in feat. 46 to array-of-objects shape, from $ReadOnlyArray<string>
  topic_links?: $ReadOnlyArray<{| +text: string, +url: string |}> | $ReadOnlyArray<string>,

  // TODO(server-3.0): Replaced in feat. 1 by topic_links
  subject_links?: $ReadOnlyArray<string>,

  orig_content?: string,
  orig_rendered_content?: string,
  prev_rendered_content_version?: number,
  content?: string,
  rendered_content?: string,
  is_me_message?: boolean,
|}>;
