import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_MUTED_TOPICS
} from '../actionConstants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.muted_topics;
    case ACCOUNT_SWITCH:
      return initialState;
    case EVENT_MUTED_TOPICS:
      return action.muted_topics;
    default:
      return state;
  }
};
