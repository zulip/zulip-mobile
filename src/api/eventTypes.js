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

import { keyMirror } from '../utils/keyMirror';
import type {
  Message,
  MutedUser,
  PropagateMode,
  Stream,
  UserId,
  UserPresence,
  UserStatusUpdate,
} from './modelTypes';
import type { RealmDataForUpdate } from './realmDataTypes';

export const EventTypes = keyMirror({
  alert_words: null,
  attachment: null,
  custom_profile_fields: null,
  default_stream_groups: null,
  default_streams: null,
  delete_message: null,
  drafts: null,
  has_zoom_token: null,
  heartbeat: null,
  hotspots: null,
  invites_changed: null,
  message: null,
  muted_topics: null,
  muted_users: null,
  // TODO(server-3.0): remove `pointer` event type, which server no longer sends
  pointer: null,
  presence: null,
  reaction: null,
  realm: null,
  realm_bot: null,
  realm_domains: null,
  realm_emoji: null,
  realm_export: null,
  realm_filters: null,
  realm_linkifiers: null,
  realm_playgrounds: null,
  realm_user: null,
  realm_user_settings_defaults: null,
  restart: null,
  stream: null,
  submessage: null,
  subscription: null,
  typing: null,
  update_display_settings: null,
  update_global_notifications: null,
  update_message: null,
  update_message_flags: null,
  user_group: null,
  user_settings: null,
  user_status: null,
});

export type EventType = $Keys<typeof EventTypes>;

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

/**
 * https://zulip.com/api/get-events#update_message
 *
 * See also `messageMoved` in `misc.js`.
 */
// This is current to feature level 109.
// NB if this ever gains a feature of moving PMs, `messageMoved` needs updating.
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
  // TODO(server-future): It'd be nice for these to be sorted; NB they may
  //   not be.  As of server 5.0-dev-3868-gca17a452f (2022-02), there's no
  //   guarantee of that in the API nor, apparently, in the implementation.
  message_ids: $ReadOnlyArray<number>,

  flags: $ReadOnlyArray<string>,
  edit_timestamp?: number,
  stream_name?: string,
  stream_id?: number,
  new_stream_id?: number,
  propagate_mode?: PropagateMode,
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
