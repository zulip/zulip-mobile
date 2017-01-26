import {
  REALM_INIT,
} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.streams;
    default:
      return state;
  }
};
