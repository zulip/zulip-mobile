/* @flow strict-local */
import isEqual from 'lodash.isequal';

import { EventTypes } from '../api/eventTypes';
import type { SubscriptionsState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_SUBSCRIPTIONS,
  EVENT_SUBSCRIPTION,
  REALM_INIT,
  EVENT,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState: SubscriptionsState = NULL_ARRAY;

const updateSubscription = (state, event) =>
  state.map(
    sub => (sub.stream_id === event.stream_id ? { ...sub, [event.property]: event.value } : sub),
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

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.stream:
          switch (event.op) {
            case 'update':
              return updateSubscription(state, event);

            case 'create':
            case 'delete':
            case 'occupy':
            case 'vacate':
              return state;

            default:
              (event: empty); // eslint-disable-line no-unused-expressions
              return state;
          }
        default:
          return state;
      }
    }
    default:
      return state;
  }
};
