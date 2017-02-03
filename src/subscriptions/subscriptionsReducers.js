import {
  LOGOUT,
  ACCOUNT_SWITCH,
  REALM_INIT,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return [];
    case REALM_INIT:
      return action.data.subscriptions;
    case EVENT_SUBSCRIPTION_ADD:
      return state.concat(
        action.subscriptions.filter(x =>
          !state.find(y => x.stream_id === y.stream_id)
        )
      );
    case EVENT_SUBSCRIPTION_REMOVE: {
      return state.filter(x =>
        !action.subscriptions.find(y => x.stream_id === y.stream_id)
      );
    }
    default:
      return state;
  }
};
