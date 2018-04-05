/* @flow */
import type {
  StreamAction,
  StreamsState,
  InitStreamsAction,
  EventStreamAddAction,
  EventStreamRemoveAction,
  EventStreamUpdateAction,
} from '../types';
import {
  INIT_STREAMS,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
  ACCOUNT_SWITCH,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState: StreamsState = NULL_ARRAY;

const initStreams = (state: StreamsState, action: InitStreamsAction): StreamsState =>
  action.streams;

const eventStreamAdd = (state: StreamsState, action: EventStreamAddAction): StreamsState =>
  state.concat(action.streams.filter(x => !state.find(y => x.stream_id === y.stream_id)));

const eventStreamRemove = (state: StreamsState, action: EventStreamRemoveAction): StreamsState =>
  filterArray(state, x => !action.streams.find(y => x && x.stream_id === y.stream_id));

const eventStreamUpdate = (state: StreamsState, action: EventStreamUpdateAction): StreamsState =>
  state.map(
    stream =>
      stream.stream_id === action.stream_id
        ? {
            ...stream,
            [action.property]: action.value,
          }
        : stream,
  );

export default (state: StreamsState = initialState, action: StreamAction): StreamsState => {
  switch (action.type) {
    case INIT_STREAMS:
      return initStreams(state, action);

    case EVENT_STREAM_ADD:
      return eventStreamAdd(state, action);

    case EVENT_STREAM_REMOVE:
      return eventStreamRemove(state, action);

    case EVENT_STREAM_UPDATE:
      return eventStreamUpdate(state, action);

    case ACCOUNT_SWITCH:
      return initialState;

    default:
      return state;
  }
};
