/* @flow strict-local */
import isEqual from 'lodash.isequal';

import type { SubscriptionsState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_SUBSCRIPTIONS,
  EVENT_STREAM_UPDATE,
  EVENT_SUBSCRIPTION,
  REALM_INIT,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState: SubscriptionsState = NULL_ARRAY;

const updateSubscription = (state, action) =>
  state.map(
    sub =>
      sub.stream_id === action.stream_id
        ? {
            ...sub,
            [action.property]: action.value,
          }
        : sub,
  );

export default (state: SubscriptionsState = initialState, action: Action): SubscriptionsState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return action.data.subscriptions || initialState;

    case INIT_SUBSCRIPTIONS:
      return isEqual(action.subscriptions, state) ? state : action.subscriptions;

    case EVENT_STREAM_UPDATE:
      return updateSubscription(state, action);

    case EVENT_SUBSCRIPTION:
      switch (action.op) {
        case 'add':
          return state.concat(
            action.subscriptions.filter(x => !state.find(y => x.stream_id === y.stream_id)),
          );
        case 'remove':
          return filterArray(
            state,
            x => !action.subscriptions.find(y => x && y && x.stream_id === y.stream_id),
          );

        case 'update':
          return updateSubscription(state, action);

        case 'peer_add':
        case 'peer_remove':
          // we currently do not track subscribers
          return state;

        default:
          (action: empty); // eslint-disable-line no-unused-expressions
          return state;
      }

    default:
      return state;
  }
};
