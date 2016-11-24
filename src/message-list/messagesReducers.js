import Immutable from 'immutable';

import {
  STREAM_FETCHED_MESSAGES,
  STREAM_SET_MESSAGES,
  EVENT_NEW_MESSAGE,
} from '../constants';

const initialState = new Immutable.List();

export default (state = initialState, action) => {
  switch (action.type) {
    case STREAM_FETCHED_MESSAGES:
      if (action.shouldAppend) {
        return state.filter((v) =>
          v.id !== action.anchor
        ).concat(action.messages);
      }
      return state.filter((v) =>
        v.id !== action.anchor
      ).unshift(...action.messages);
    case STREAM_SET_MESSAGES:
      return new Immutable.List(action.messages);
    case EVENT_NEW_MESSAGE:
      return state.messages.push(action.message);
    default:
      return state;
  }
};
