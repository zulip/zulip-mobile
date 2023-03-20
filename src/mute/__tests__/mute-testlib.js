/* @flow strict-local */

import { reducer } from '../muteModel';
import type { MuteState } from '../muteModelTypes';
import { type Stream, type UserTopic, UserTopicVisibilityPolicy } from '../../api/modelTypes';
import * as eg from '../../__tests__/lib/exampleData';

export const makeUserTopic = (
  stream: Stream,
  topic: string,
  visibility_policy: UserTopicVisibilityPolicy,
): UserTopic => ({
  stream_id: stream.stream_id,
  topic_name: topic,
  visibility_policy,
  last_updated: 12345, // arbitrary value; we ignore last_updated here
});

/**
 * Convenience constructor for a MuteState.
 *
 * The tuples are (stream, topic, policy).
 * The policy defaults to UserTopicVisibilityPolicy.Muted.
 */
export const makeMuteState = (
  data: $ReadOnlyArray<[Stream, string] | [Stream, string, UserTopicVisibilityPolicy]>,
): MuteState =>
  reducer(
    undefined,
    eg.mkActionRegisterComplete({
      user_topics: data.map(args => {
        // $FlowIgnore[invalid-tuple-index]: we're supplying a default
        const [stream, topic, policy = UserTopicVisibilityPolicy.Muted] = args;
        return makeUserTopic(stream, topic, policy);
      }),
    }),
    eg.reduxState(),
  );
