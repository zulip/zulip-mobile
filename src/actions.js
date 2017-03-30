import { BATCH_ACTIONS } from './constants';

export * from './app/appActions';
export * from './account/accountActions';
export * from './events/eventActions';
export * from './nav/navActions';
export * from './message/messagesActions';
export * from './realm/realmActions';
export * from './streamlist/streamsActions';
export * from './subscriptions/subscriptionsActions';
export * from './users/usersActions';

export const batchActions = (...actions) => ({
  type: BATCH_ACTIONS,
  actions,
});
