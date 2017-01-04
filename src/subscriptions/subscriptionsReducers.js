import {
  REALM_INIT,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case REALM_INIT:
      return action.data.subscriptions;
    case EVENT_SUBSCRIPTION_ADD:
      return state;
    case EVENT_SUBSCRIPTION_REMOVE:
      return state;
    default:
      return state;
  }
};
