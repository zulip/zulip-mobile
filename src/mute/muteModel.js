/* @flow strict-local */
import Immutable from 'immutable';

import type { MuteState, PerAccountApplicableAction, PerAccountState } from '../types';
import { UserTopicVisibilityPolicy } from '../api/modelTypes';
import { REGISTER_COMPLETE, EVENT_MUTED_TOPICS, RESET_ACCOUNT_DATA } from '../actionConstants';
import { getStreamsByName } from '../subscriptions/subscriptionSelectors';
import * as logging from '../utils/logging';
import DefaultMap from '../utils/DefaultMap';

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

function convert(data, streams): MuteState {
  // Turn the incoming array into a nice, indexed, Immutable data structure
  // in the same two-phase pattern we use for the unread data, as an
  // optimization.  Here it's probably much less often enough data for the
  // optimization to matter; but a longtime user who regularly uses this
  // feature will accumulate many records over time, and then it could.

  // First, collect together all the data for a given stream, just in a
  // plain old Array.
  const byStream = new DefaultMap(() => []);
  for (const [streamName, topic] of data) {
    const stream = streams.get(streamName);
    if (!stream) {
      logging.warn('mute: unknown stream');
      continue;
    }
    byStream.getOrCreate(stream.stream_id).push([topic, UserTopicVisibilityPolicy.Muted]);
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
      // We require this `globalState` to reflect the `streams` sub-reducer
      // already having run, so that `getStreamsByName` gives the data we
      // just received.  See this sub-reducer's call site in `reducers.js`.
      return convert(
        action.data.muted_topics
          // TODO(#5102): Delete fallback once we enforce any threshold for
          //   ancient servers we refuse to connect to. It was added in
          //   #2878 (2018-11-16), but it wasn't clear even then, it seems,
          //   whether any servers actually omit the data. The API doc
          //   doesn't mention any servers that omit it, and our Flow types
          //   mark it required.
          ?? [],
        getStreamsByName(globalState),
      );

    case EVENT_MUTED_TOPICS:
      return convert(action.muted_topics, getStreamsByName(globalState));

    default:
      return state;
  }
};
