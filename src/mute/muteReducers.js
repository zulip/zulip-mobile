import {
  REALM_INIT,
  ACCOUNT_SWITCH,
} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.muted_topics;
    case ACCOUNT_SWITCH:
      return initialState;
    default:
      return state;
  }
};
