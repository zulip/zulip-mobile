/* @flow */
import type { Action, StreamsState } from '../types';
import {
  INIT_STREAMS,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
  EVENT_STREAM_OCCUPY,
  ACCOUNT_SWITCH,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: StreamsState = NULL_ARRAY;

export default (state: StreamsState = initialState, action: Action): StreamsState => {
  switch (action.type) {
    case INIT_STREAMS:
      return action.streams;

    case EVENT_STREAM_ADD:
      return state.concat(
        action.streams.filter(x => !state.find(y => x.stream_id === y.stream_id)),
      );

    case EVENT_STREAM_REMOVE:
      return state.filter(x => !action.streams.find(y => x.stream_id === y.stream_id));

    case EVENT_STREAM_UPDATE:
      return state.map(
        stream =>
          stream.stream_id === action.stream_id
            ? {
                ...stream,
                [action.property]: action.value,
              }
            : stream,
      );

    case EVENT_STREAM_OCCUPY:
      return state;

    case ACCOUNT_SWITCH:
      return initialState;

    default:
      return state;
  }
};
