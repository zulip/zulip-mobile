/* @flow strict-local */
import { EventTypes } from '../api/eventTypes';
import type { Action, StreamsState } from '../types';
import { ensureUnreachable } from '../types';
import { LOGOUT, ACCOUNT_SWITCH, EVENT, REALM_INIT } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState: StreamsState = NULL_ARRAY;

export default (state: StreamsState = initialState, action: Action): StreamsState => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.streams || initialState;

    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.stream:
          switch (event.op) {
            case 'create':
              return state.concat(
                event.streams.filter(x => !state.find(y => x.stream_id === y.stream_id)),
              );

            case 'delete':
              return filterArray(
                state,
                x => !event.streams.find(y => x && x.stream_id === y.stream_id),
              );

            case 'update':
              return state.map(stream =>
                stream.stream_id === event.stream_id
                  ? {
                      ...stream,
                      [event.property]: event.value,
                    }
                  : stream,
              );

            case 'occupy':
            case 'vacate':
              return state;

            default:
              ensureUnreachable(event);
              return state;
          }
        default:
          return state;
      }
    }
    default:
      return state;
  }
};
