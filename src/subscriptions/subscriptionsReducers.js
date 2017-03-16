import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_SUBSCRIPTIONS,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_SUBSCRIPTION_UPDATE,
  EVENT_SUBSCRIPTION_PEER_ADD,
} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return [];

    case INIT_SUBSCRIPTIONS:
      return action.subscriptions;

    case EVENT_SUBSCRIPTION_ADD:
      return state.concat(
        action.subscriptions.filter(x =>
          !state.find(y => x.stream_id === y.stream_id)
        )
      );

    case EVENT_SUBSCRIPTION_REMOVE:
      return state.filter(x =>
        !action.subscriptions.find(y => x.stream_id === y.stream_id)
      );

    case EVENT_SUBSCRIPTION_UPDATE:
      return state; // TODO

    case EVENT_SUBSCRIPTION_PEER_ADD:
      return state.map(subscription => {
        const sub = action.subscriptions.indexOf(subscription.stream_id);
        if (sub === -1 || subscription.subscribers.includes(action.user.email)) {
          return subscription;
        }

        return {
          ...subscription,
          subscribers: [
            ...subscription.subscribers,
            action.user.email,
          ],
        };
      });

    default:
      return state;
  }
};
