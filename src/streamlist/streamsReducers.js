import {
  INIT_STREAMS,
  EVENT_STREAM_CREATE,
  EVENT_STREAM_DELETE,
  EVENT_STREAM_UPDATE,
  EVENT_STREAM_OCCUPY,
  ACCOUNT_SWITCH,
} from '../actionConstants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case INIT_STREAMS:
      return action.streams;

    case EVENT_STREAM_CREATE:
      return state.concat(
        action.streams.filter(x =>
          !state.find(y => x.stream_id === y.stream_id)
        )
      );

    case EVENT_STREAM_DELETE:
      return state.filter(x =>
        !action.streams.find(y => x.stream_id === y.stream_id)
      );

    case EVENT_STREAM_UPDATE:
      return state.map(stream =>
        (stream.stream_id === action.stream_id ? { ...stream,
          [action.property]: action.value } : stream));

    case EVENT_STREAM_OCCUPY:
      return state;

    case ACCOUNT_SWITCH:
      return initialState;

    default:
      return state;
  }
};
