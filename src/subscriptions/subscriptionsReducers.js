/* @flow */
import isEqual from 'lodash.isequal';

import type { SubscriptionsState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_SUBSCRIPTIONS,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_SUBSCRIPTION_UPDATE,
  EVENT_SUBSCRIPTION_PEER_ADD,
  EVENT_SUBSCRIPTION_PEER_REMOVE,
  REALM_INIT,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';

const initialState: SubscriptionsState = NULL_ARRAY;

export default (state: SubscriptionsState = initialState, action: Action): SubscriptionsState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return isEqual(action.data.subscriptions, state) ? state : action.data.subscriptions;

    case INIT_SUBSCRIPTIONS:
      return isEqual(action.subscriptions, state) ? state : action.subscriptions;

    case EVENT_SUBSCRIPTION_ADD:
      return state.concat(
        action.subscriptions.filter(x => !state.find(y => x.stream_id === y.stream_id)),
      );

    case EVENT_SUBSCRIPTION_REMOVE:
      return state.filter(x => !action.subscriptions.find(y => x.stream_id === y.stream_id));

    case EVENT_SUBSCRIPTION_UPDATE:
      return state.map(
        sub =>
          sub.stream_id === action.stream_id
            ? {
                ...sub,
                [action.property]: action.value,
              }
            : sub,
      );

    case EVENT_SUBSCRIPTION_PEER_ADD:
      return state;

    // we currently do not track subscribers

    // return state.map(subscription => {
    //   const shouldNotAddToStream = action.subscriptions.indexOf(subscription.stream_id) === -1;
    //   const userAlreadySubscribed = subscription.subscribers.includes(action.user.email);
    //   if (shouldNotAddToStream || userAlreadySubscribed) {
    //     return subscription;
    //   }
    //
    //   return {
    //     ...subscription,
    //     subscribers: [...subscription.subscribers, action.user.email],
    //   };
    // });

    case EVENT_SUBSCRIPTION_PEER_REMOVE:
      return state;

    // we currently do not track subscribers

    // return state.map(subscription => ({
    //   ...subscription,
    //   subscribers: subscription.subscribers.filter(sub => sub !== action.user.email),
    // }));

    default:
      return state;
  }
};
