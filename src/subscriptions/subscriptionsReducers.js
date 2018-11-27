/* @flow strict-local */
import isEqual from 'lodash.isequal';

import type {
  SubscriptionsState,
  SubscriptionsAction,
  InitSubscriptionsAction,
  RealmInitAction,
  EventSubscriptionAddAction,
  EventSubscriptionRemoveAction,
  EventSubscriptionUpdateAction,
} from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  INIT_SUBSCRIPTIONS,
  EVENT_STREAM_UPDATE,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_SUBSCRIPTION_UPDATE,
  EVENT_SUBSCRIPTION_PEER_ADD,
  EVENT_SUBSCRIPTION_PEER_REMOVE,
  REALM_INIT,
} from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState: SubscriptionsState = NULL_ARRAY;

const realmInit = (state: SubscriptionsState, action: RealmInitAction): SubscriptionsState =>
  action.data.subscriptions || initialState;

const initSubscriptions = (
  state: SubscriptionsState,
  action: InitSubscriptionsAction,
): SubscriptionsState => (isEqual(action.subscriptions, state) ? state : action.subscriptions);

const eventSubscriptionAdd = (
  state: SubscriptionsState,
  action: EventSubscriptionAddAction,
): SubscriptionsState =>
  state.concat(action.subscriptions.filter(x => !state.find(y => x.stream_id === y.stream_id)));

const eventSubscriptionRemove = (
  state: SubscriptionsState,
  action: EventSubscriptionRemoveAction,
): SubscriptionsState =>
  filterArray(state, x => !action.subscriptions.find(y => x && y && x.stream_id === y.stream_id));

const eventSubscriptionUpdate = (
  state: SubscriptionsState,
  action: EventSubscriptionUpdateAction,
): SubscriptionsState =>
  state.map(
    sub =>
      sub.stream_id === action.stream_id
        ? {
            ...sub,
            [action.property]: action.value,
          }
        : sub,
  );

export default (
  state: SubscriptionsState = initialState,
  action: SubscriptionsAction,
): SubscriptionsState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT:
      return realmInit(state, action);

    case INIT_SUBSCRIPTIONS:
      return initSubscriptions(state, action);

    case EVENT_SUBSCRIPTION_ADD:
      return eventSubscriptionAdd(state, action);

    case EVENT_SUBSCRIPTION_REMOVE:
      return eventSubscriptionRemove(state, action);

    case EVENT_STREAM_UPDATE:
    case EVENT_SUBSCRIPTION_UPDATE:
      return eventSubscriptionUpdate(state, action);

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
