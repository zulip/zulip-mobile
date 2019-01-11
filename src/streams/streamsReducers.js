/* @flow strict-local */
import type { Action, StreamsState } from '../types';
import { INIT_STREAMS, ACCOUNT_SWITCH, EVENT_STREAM } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState: StreamsState = NULL_ARRAY;

export default (state: StreamsState = initialState, action: Action): StreamsState => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return initialState;

    case INIT_STREAMS:
      return action.streams;

    case EVENT_STREAM:
      switch (action.op) {
        case 'create':
          return state.concat(
            action.streams.filter(x => !state.find(y => x.stream_id === y.stream_id)),
          );

        case 'delete':
          return filterArray(
            state,
            x => !action.streams.find(y => x && x.stream_id === y.stream_id),
          );

        case 'update':
          return state.map(
            stream =>
              stream.stream_id === action.stream_id
                ? {
                    ...stream,
                    [action.property]: action.value,
                  }
                : stream,
          );

        case 'occupy':
          return state;

        default:
          (action: empty); // eslint-disable-line no-unused-expressions
          return state;
      }

    default:
      return state;
  }
};
