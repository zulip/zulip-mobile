/* @flow strict-local */
import { EventTypes } from '../api/eventTypes';
import type { SubscriptionsState, Action } from '../types';
import { ensureUnreachable } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  EVENT_SUBSCRIPTION,
  REGISTER_COMPLETE,
  EVENT,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState: SubscriptionsState = NULL_ARRAY;

const updateSubscription = (state, event) =>
  state.map(sub =>
    sub.stream_id === event.stream_id ? { ...sub, [event.property]: event.value } : sub,
  );

export default (state: SubscriptionsState = initialState, action: Action): SubscriptionsState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REGISTER_COMPLETE:
      return action.data.subscriptions;

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
          ensureUnreachable(action);
          return state;
      }

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.stream:
          switch (event.op) {
            case 'update':
              return updateSubscription(state, event);

            case 'delete':
              return filterArray(
                state,
                sub => !event.streams.find(stream => sub.stream_id === stream.stream_id),
              );

            case 'create':
            case 'occupy':
            case 'vacate':
              return state;

            default:
              ensureUnreachable(event);
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
