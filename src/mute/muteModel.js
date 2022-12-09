/* @flow strict-local */

import type { MuteState, PerAccountApplicableAction, PerAccountState } from '../types';
import {
  REGISTER_COMPLETE,
  LOGOUT,
  ACCOUNT_SWITCH,
  EVENT_MUTED_TOPICS,
  LOGIN_SUCCESS,
} from '../actionConstants';
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
  state: MuteState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
  globalState: PerAccountState,
): MuteState => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
    case LOGIN_SUCCESS:
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
