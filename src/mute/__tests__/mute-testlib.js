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

export const makeMuteState = (data: $ReadOnlyArray<[Stream, string]>): MuteState =>
  reducer(
    undefined,
    eg.mkActionRegisterComplete({
      user_topics: data.map(([stream, topic]) =>
        makeUserTopic(stream, topic, UserTopicVisibilityPolicy.Muted),
      ),
    }),
    eg.reduxState(),
  );
