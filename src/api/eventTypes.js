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
  /* Indicates if the client can receive push notifications. This property
   * was intended for showing a user's presence status as "on mobile" if
   * they are inactive on all devices but can receive push notifications
   * (see zulip/zulip bd20a756f9). However, this property doesn't seem to be
   * used anywhere on the web app or the mobile client, and can be
   * considered legacy.
   */
  pushable: boolean,
|};

//
// Then, the events themselves.
//

export type HeartbeatEvent = {|
  type: 'heartbeat',
  id: number,
|};

export type MessageEvent = {|
  type: 'message',
  id: number,
|};

export type PresenceEvent = {|
  type: 'message',
  id: number,
  email: string,
  presence: { [client: string]: ClientPresence },
  server_timestamp: number,
|};

export type UpdateMessageFlagsEvent = {|
  type: 'update_message_flags',
  id: number,
  all: boolean,
  flag: 'read' | '???',
  messages: number[],
  operation: 'add' | '???',
|};
