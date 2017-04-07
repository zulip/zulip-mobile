import {REALM_INIT} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.muted_topics;
    default:
      return state;
  }
};
