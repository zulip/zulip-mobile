import {
  INIT_STREAMS,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
  ACCOUNT_SWITCH,
} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case INIT_STREAMS:
      return action.streams;

    case EVENT_STREAM_ADD:
      return state; // TODO

    case EVENT_STREAM_REMOVE:
      return state; // TODO

    case EVENT_STREAM_UPDATE:
      return state; // TODO

    case ACCOUNT_SWITCH:
      return initialState;

    default:
      return state;
  }
};
