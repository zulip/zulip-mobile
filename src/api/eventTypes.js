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

import type { SubsetProperties } from '../generics';
import { keyMirror } from '../utils/keyMirror';
import type {
  CustomProfileField,
  Message,
  UserOrBot,
  MutedUser,
  PropagateMode,
  Stream,
  UserId,
  UserMessageFlag,
  UserPresence,
  UserStatusUpdate,
  UserSettings,
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

/** https://zulip.com/api/get-events#custom_profile_fields */
export type CustomProfileFieldsEvent = {|
  ...EventCommon,
  type: typeof EventTypes.custom_profile_fields,
  fields: $ReadOnlyArray<CustomProfileField>,
|};

export type MessageEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.message,

  // TODO: This doesn't describe what we get from the server (see, e.g.,
  //   avatar_url). Write a type that does; perhaps it can go in
  //   rawModelTypes.js.
  message: Message,

  /** See the same-named property on `Message`. */
  flags?: $ReadOnlyArray<UserMessageFlag>,

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

type StreamUpdateEventBase<K: $Keys<Stream>> = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.stream,
  op: 'update',
  stream_id: number,
  name: string,
  property: K,
  value: Stream[K],
|}>;

// https://zulip.com/api/get-events#stream-update
export type StreamUpdateEvent =
  | {| ...StreamUpdateEventBase<'name'> |}
  | {|
      ...StreamUpdateEventBase<'description'>,
      +rendered_description: Stream['rendered_description'],
    |}
  // TODO(server-4.0): New in FL 30.
  | {| ...StreamUpdateEventBase<'date_created'> |}
  | {|
      ...StreamUpdateEventBase<'invite_only'>,
      +history_public_to_subscribers: Stream['history_public_to_subscribers'],

      // TODO(server-5.0): New in FL 71.
      +is_web_public?: Stream['is_web_public'],
    |}
  | {| ...StreamUpdateEventBase<'rendered_description'> |}
  | {| ...StreamUpdateEventBase<'is_web_public'> |}
  // TODO(server-3.0): New in FL 1; expect is_announcement_only from older
  //   servers.
  | {| ...StreamUpdateEventBase<'stream_post_policy'> |}
  // Special values are:
  //   *  null: default; inherits from org-level setting
  //   * -1: unlimited retention
  // These special values differ from updateStream's and createStream's params; see
  //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/message_retention_days/near/1367895
  // TODO(server-3.0): New in FL 17.
  | {| ...StreamUpdateEventBase<'message_retention_days'> |}
  | {| ...StreamUpdateEventBase<'history_public_to_subscribers'> |}
  | {| ...StreamUpdateEventBase<'first_message_id'> |}
  // TODO(server-3.0): Deprecated at FL 1; expect stream_post_policy from
  //   newer servers.
  | {| ...StreamUpdateEventBase<'is_announcement_only'> |};

// prettier-ignore
export type StreamEvent =
  | {| ...StreamListEvent, +op: 'create', |}
  | {| ...StreamListEvent, +op: 'delete', |}
  | {| ...StreamListEvent, +op: 'occupy', |}
  | {| ...StreamListEvent, +op: 'vacate', |}
  | StreamUpdateEvent;

export type UpdateMessageFlagsMessageDetails =
  | {| type: 'stream', mentioned?: true, stream_id: number, topic: string |}
  | {| type: 'private', mentioned?: true, user_ids: $ReadOnlyArray<UserId> |};

// https://zulip.com/api/get-events#update_message_flags-add
// https://zulip.com/api/get-events#update_message_flags-remove
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

  message_details?: {|
    [string]: UpdateMessageFlagsMessageDetails,
  |},
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
  value: RealmDataForUpdate[$Keys<RealmDataForUpdate>],

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
 * https://zulip.com/api/get-events#user_settings-update
 *
 * New in Zulip 5.0, FL 89.
 */
export type UserSettingsUpdateEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.user_settings,

  op: 'update',

  // TODO(flow): `property` and `value` should correspond
  property: $Keys<UserSettings>,
  value: $Values<UserSettings>,

  language_name?: string,
|}>;

/**
 * https://zulip.com/api/get-events#update_message
 *
 * See also `messageMoved` in `misc.js`.
 */
// This is current to feature level 132.
// NB if this ever gains a feature of moving PMs, `messageMoved` needs updating.
export type UpdateMessageEvent = $ReadOnly<{|
  ...EventCommon,
  type: typeof EventTypes.update_message,

  // Before FL 114, can be absent with the same meaning as null.
  // TODO(server-5.0): Make required.
  user_id?: UserId | null,

  // TODO(server-5.0): New in FL 114. On old servers, infer from `user_id`.
  rendering_only?: boolean,

  // Any content changes apply to just message_id.
  message_id: number,

  // Any stream/topic changes apply to all of message_ids, which is
  //   guaranteed to include message_id.
  // TODO(server-future): It'd be nice for these to be sorted; NB they may
  //   not be.  As of server 5.0-dev-3868-gca17a452f (2022-02), there's no
  //   guarantee of that in the API nor, apparently, in the implementation.
  message_ids: $ReadOnlyArray<number>,

  flags: $ReadOnlyArray<UserMessageFlag>,

  // TODO(server-5.0): Always present as of FL 114; make required.
  edit_timestamp?: number,

  stream_name?: string,

  // As of FL 112, present for all stream-message updates.
  // TODO(server-5.0): Remove comment but keep optional; absent for PMs.
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

type PersonCommon =
  | SubsetProperties<UserOrBot, {| +user_id: mixed, +full_name: mixed |}>
  | SubsetProperties<
      UserOrBot,
      {|
        +user_id: mixed,
        // -email?: mixed, // deprecated
        +timezone: mixed,
      |},
    >
  | SubsetProperties<UserOrBot, {| +user_id: mixed, +bot_owner_id: mixed |}>
  | SubsetProperties<UserOrBot, {| +user_id: mixed, +role: mixed |}>
  | SubsetProperties<UserOrBot, {| +user_id: mixed, +is_billing_admin: mixed |}>
  | SubsetProperties<UserOrBot, {| +user_id: mixed, +delivery_email: mixed |}>
  | {|
      +user_id: UserOrBot['user_id'],
      +custom_profile_field: {| +id: number, +value: string | null, +rendered_value?: string |},
    |}
  | {| +user_id: UserOrBot['user_id'], +new_email: string |};

/**
 * A realm_user update event, straight from the server.
 *
 * Doc: https://zulip.com/api/get-events#realm_user-update
 */
// Current to FL 129.
export type RealmUserUpdateEventRaw = {|
  ...EventCommon,
  +type: typeof EventTypes.realm_user,
  +op: 'update',
  +person:
    | PersonCommon
    | {|
        ...SubsetProperties<
          UserOrBot,
          {|
            +user_id: mixed,

            // TODO: This is documented in the event. If handling, see if
            // the object at `avatar_url` needs to change to stay in sync.
            // avatar_version: number,
          |},
        >,
        +avatar_url: string | null,

        // These are documented in the event, but they're not documented in
        // the collections of users and bots in the initial data. Ignore.
        // avatar_source: string,
        // avatar_url_medium: string,
      |},
|};

/** A realm_user update event, after we've processed it at the edge. */
export type RealmUserUpdateEvent = {|
  ...EventCommon,
  +type: typeof EventTypes.realm_user,
  +op: 'update',
  +person:
    | PersonCommon
    | {|
        ...SubsetProperties<
          UserOrBot,
          {|
            +user_id: mixed,
            +avatar_url: mixed,

            // TODO: This is documented in the event. If handling, see if
            // the object at `avatar_url` needs to change to stay in sync.
            // avatar_version: number,
          |},
        >,

        // These are documented in the event, but they're not documented in
        // the collections of users and bots in the initial data. Ignore.
        // avatar_source: string,
        // avatar_url_medium: string,
      |},
|};
