import {INIT_STREAMS} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case INIT_STREAMS:
      return action.streams;
    default:
      return state;
  }
};
