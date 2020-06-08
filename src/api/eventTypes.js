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

import type { Message, Stream, UserPresence } from './modelTypes';

export class EventTypes {
  static heartbeat: 'heartbeat' = 'heartbeat';
  static message: 'message' = 'message';
  static presence: 'presence' = 'presence';
  static stream: 'stream' = 'stream';
  static submessage: 'submessage' = 'submessage';
  static update_message_flags: 'update_message_flags' = 'update_message_flags';
  static user_status: 'user_status' = 'user_status';
}

type EventCommon = {|
  id: number,
|};

/** A common supertype of all events, known or unknown. */
export type GeneralEvent = {
  ...EventCommon,
  type: string,
  // Note this is an inexact object type!  There will be more properties.
};

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

/** A new submessage.  See the `Submessage` type for details. */
export type SubmessageEvent = {|
  ...EventCommon,
  type: typeof EventTypes.submessage,
  submessage_id: number,
  message_id: number,
  sender_id: number,
  msg_type: 'widget',
  content: string,
|};

export type PresenceEvent = {|
  ...EventCommon,
  type: typeof EventTypes.presence,
  email: string,
  server_timestamp: number,
  presence: UserPresence,
|};

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
export type UserStatusEvent = {|
  ...EventCommon,
  type: typeof EventTypes.user_status,
  user_id: number,
  away?: boolean,
  status_text?: string,
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
