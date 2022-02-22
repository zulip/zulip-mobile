/**
 * Functions to interpret some data from the API.
 *
 * @flow strict-local
 */
import invariant from 'invariant';

import type { UpdateMessageEvent } from './eventTypes';
import * as logging from '../utils/logging';

export type MessageMove = $ReadOnly<{|
  orig_stream_id: number,
  new_stream_id: number,
  orig_topic: string,
  new_topic: string,
|}>;

/**
 * Determine if and where this edit moved the message.
 *
 * If a move did occur, returns the relevant information in a form with a
 * consistent naming convention.
 *
 * Returns null if the message stayed at the same conversation.
 */
export function messageMoved(event: UpdateMessageEvent): null | MessageMove {
  // The API uses "new" for the stream IDs and "orig" for the topics.
  // Put them both in a consistent naming convention.
  const orig_stream_id = event.stream_id;
  if (orig_stream_id == null) {
    // Not stream messages, or else a pure content edit (no stream/topic change.)
    // TODO(server-5.0): Simplify comment: since FL 112 this means it's
    //   just not a stream message.
    return null;
  }
  const new_stream_id = event.new_stream_id ?? orig_stream_id;
  const orig_topic = event.orig_subject;
  const new_topic = event.subject ?? orig_topic;

  if (new_topic === orig_topic && new_stream_id === orig_stream_id) {
    // Stream and topic didn't change.
    return null;
  }

  if (orig_topic == null) {
    // `orig_subject` is documented to be present when either the
    // stream or topic changed.
    logging.warn('Got update_message event with stream/topic change and no orig_subject');
    return null;
  }
  invariant(new_topic != null, 'new_topic must be non-nullish when orig_topic is, by `??`');

  return { orig_stream_id, new_stream_id, orig_topic, new_topic };
}
