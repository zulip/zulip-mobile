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

//
// Then, the events themselves.
//

type EventCommon = {|
  id: number,
|};

export type HeartbeatEvent = {|
  ...EventCommon,
  type: 'heartbeat',
|};

export type MessageEvent = {|
  ...EventCommon,
  type: empty, // 'message' -- TODO fill in rest
|};

export type PresenceEvent = {|
  ...EventCommon,
  type: 'presence',
  email: string,
  server_timestamp: number,
  presence: { [client: string]: ClientPresence },
|};

export type UpdateMessageFlagsEvent = {|
  ...EventCommon,
  type: 'update_message_flags',
  operation: 'add' | 'remove',
  flag: empty, // TODO fill in
  all: boolean,
  messages: number[],
|};
