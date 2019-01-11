/**
 * Types for events returned by the server.
 *
 * See server docs:
 *   https://zulipchat.com/api/real-time-events
 *   https://zulip.readthedocs.io/en/latest/subsystems/events-system.html
 *
 * NB this is just a start -- far from complete.
 *
 * @flow strict-local
 */

import type { Message, Stream } from './apiTypes';

//
// First, types used inside events.
//

/** See ClientPresence, and the doc linked there. */
export type UserStatus = 'active' | 'idle' | 'offline';

/**
 * A user's presence status, as reported by a specific client.
 *
 * For an explanation of the Zulip presence model and how to interpret
 * `status` and `timestamp`, see the subsystem doc:
 *   https://zulip.readthedocs.io/en/latest/subsystems/presence.html
 *
 * @prop timestamp - When the server last heard from this client.
 * @prop status - See the presence subsystem doc.
 * @prop client
 * @prop pushable - Legacy; unused.
 */
export type ClientPresence = {|
  status: UserStatus,
  timestamp: number,
  client: string,

  /**
   * Indicates if the client can receive push notifications. This property
   * was intended for showing a user's presence status as "on mobile" if
   * they are inactive on all devices but can receive push notifications
   * (see zulip/zulip bd20a756f9). However, this property doesn't seem to be
   * used anywhere on the web app or the mobile client, and can be
   * considered legacy.
   *
   * Empirically this is `boolean` on at least some clients, and absent on
   * `aggregated`.  By writing `empty` we make it an error to actually use it.
   */
  pushable?: empty,
|};

/**
 * A user's presence status, including all information from all their clients.
 *
 * The `aggregated` property equals one of the others.  For details, see:
 *   https://zulipchat.com/api/get-presence
 *
 * See also the app's `getAggregatedPresence`, which reimplements a version
 * of the logic to compute `aggregated`.
 */
export type UserPresence = {|
  aggregated: ClientPresence,
  [client: string]: ClientPresence,
|};

//
// Then, the events themselves.
//

export class EventTypes {
  static heartbeat: 'heartbeat' = 'heartbeat';
  static message: 'message' = 'message';
  static presence: 'presence' = 'presence';
  static stream: 'stream' = 'stream';
  static update_message_flags: 'update_message_flags' = 'update_message_flags';
}

type EventCommon = {|
  id: number,
|};

export type HeartbeatEvent = {|
  ...EventCommon,
  type: typeof EventTypes.heartbeat,
|};

export type MessageEvent = {|
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
|};

export type PresenceEvent = {|
  ...EventCommon,
  type: typeof EventTypes.presence,
  email: string,
  server_timestamp: number,
  presence: UserPresence,
|};

type StreamListEvent = {|
  ...EventCommon,
  type: typeof EventTypes.stream,
  streams: Stream[],
|};

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

export type UpdateMessageFlagsEvent = {|
  ...EventCommon,
  type: typeof EventTypes.update_message_flags,
  operation: 'add' | 'remove',
  flag: empty, // TODO fill in
  all: boolean,
  messages: number[],
|};
