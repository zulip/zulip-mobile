/* @flow strict-local */

import type { MuteState, PerAccountApplicableAction, PerAccountState } from '../types';
import { REGISTER_COMPLETE, LOGOUT, ACCOUNT_SWITCH, EVENT_MUTED_TOPICS } from '../actionConstants';
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

export const isTopicMuted = (streamId: number, topic: string, mute: MuteState): boolean =>
  mute.get(streamId)?.has(topic) ?? false;

//
//
// Reducer.
//

const initialState: MuteState = new Map();

function convert(data, streams): MuteState {
  const result = new DefaultMap(() => new Set());
  for (const [streamName, topic] of data) {
    const stream = streams.get(streamName);
    if (!stream) {
      logging.warn('mute: unknown stream');
      continue;
    }
    result.getOrCreate(stream.stream_id).add(topic);
  }
  return result.map;
}

export const reducer = (
  state: MuteState = initialState,
  action: PerAccountApplicableAction,
  globalState: PerAccountState,
): MuteState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
      // We require this `globalState` to reflect the `streams` sub-reducer
      // already having run, so that `getStreamsByName` gives the data we
      // just received.  See this sub-reducer's call site in `reducers.js`.
      return convert(action.data.muted_topics ?? [], getStreamsByName(globalState));

    case EVENT_MUTED_TOPICS:
      return convert(action.muted_topics, getStreamsByName(globalState));

    default:
      return state;
  }
};
