/* @flow strict-local */
import Immutable from 'immutable';

import type { MuteState, PerAccountApplicableAction, PerAccountState } from '../types';
import { UserTopicVisibilityPolicy } from '../api/modelTypes';
import { EventTypes } from '../api/eventTypes';
import {
  REGISTER_COMPLETE,
  EVENT_MUTED_TOPICS,
  RESET_ACCOUNT_DATA,
  EVENT,
} from '../actionConstants';
import { getStreamsByName } from '../subscriptions/subscriptionSelectors';
import * as logging from '../utils/logging';
import DefaultMap from '../utils/DefaultMap';
import { updateAndPrune } from '../immutableUtils';

//
//
// Selectors.
//

export const getMute = (state: PerAccountState): MuteState => state.mute;

//
//
// Getters.
//

export function getTopicVisibilityPolicy(
  mute: MuteState,
  streamId: number,
  topic: string,
): UserTopicVisibilityPolicy {
  return mute.get(streamId)?.get(topic) ?? UserTopicVisibilityPolicy.None;
}

export function isTopicMuted(streamId: number, topic: string, mute: MuteState): boolean {
  const policy = getTopicVisibilityPolicy(mute, streamId, topic);
  switch (policy) {
    case UserTopicVisibilityPolicy.None:
      return false;
    case UserTopicVisibilityPolicy.Muted:
      return true;
  }
}

//
//
// Reducer.
//

const initialState: MuteState = Immutable.Map();

/** Consume the old `muted_topics` format. */
function convertLegacy(data, streams): MuteState {
  // Same strategy as in convertInitial, below.

  const byStream = new DefaultMap(() => []);
  for (const [streamName, topic] of data) {
    const stream = streams.get(streamName);
    if (!stream) {
      logging.warn('mute: unknown stream');
      continue;
    }
    byStream.getOrCreate(stream.stream_id).push([topic, UserTopicVisibilityPolicy.Muted]);
  }

  return Immutable.Map(Immutable.Seq.Keyed(byStream.map.entries()).map(Immutable.Map));
}

function convertInitial(data): MuteState {
  // Turn the incoming array into a nice, indexed, Immutable data structure
  // in the same two-phase pattern we use for the unread data, as an
  // optimization.  Here it's probably much less often enough data for the
  // optimization to matter; but a longtime user who regularly uses this
  // feature will accumulate many records over time, and then it could.

  // First, collect together all the data for a given stream, just in a
  // plain old Array.
  const byStream = new DefaultMap(() => []);
  for (const { stream_id, topic_name, visibility_policy } of data) {
    if (!UserTopicVisibilityPolicy.isValid((visibility_policy: number))) {
      // Not a value we expect.  Keep it out of our data structures.
      logging.warn(`unexpected UserTopicVisibilityPolicy: ${(visibility_policy: number)}`);
      continue;
    }
    byStream.getOrCreate(stream_id).push([topic_name, visibility_policy]);
  }

  // Then, from each of those build an Immutable.Map all in one shot.
  return Immutable.Map(Immutable.Seq.Keyed(byStream.map.entries()).map(Immutable.Map));
}

export const reducer = (
  state: MuteState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
  globalState: PerAccountState,
): MuteState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    case REGISTER_COMPLETE:
      if (action.data.user_topics) {
        return convertInitial(action.data.user_topics);
      }
      // We require this `globalState` to reflect the `streams` sub-reducer
      // already having run, so that `getStreamsByName` gives the data we
      // just received.  See this sub-reducer's call site in `reducers.js`.
      // TODO(server-6.0): Stop caring about that, when we cut muted_topics.
      return convertLegacy(
        action.data.muted_topics
          // Unnecessary fallback just to satisfy Flow: the old
          // `muted_topics` is absent only when the new `user_topics` is
          // present (ignoring ancient unsupported servers), but Flow
          // doesn't track that.
          ?? [],
        getStreamsByName(globalState),
      );

    case EVENT_MUTED_TOPICS:
      return convertLegacy(action.muted_topics, getStreamsByName(globalState));

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.user_topic: {
          const { stream_id, topic_name, visibility_policy } = event;
          if (visibility_policy === UserTopicVisibilityPolicy.None) {
            // This is the "zero value" for this type, which our MuteState
            // data structure represents by leaving the topic out entirely.
            return updateAndPrune(
              state,
              Immutable.Map(),
              stream_id,
              (perStream = Immutable.Map()) => perStream.delete(topic_name),
            );
          }
          return state.updateIn([stream_id, topic_name], () => visibility_policy);
        }

        default:
          return state;
      }
    }

    default:
      return state;
  }
};
