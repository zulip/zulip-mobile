import { BATCH_ACTIONS } from './constants';

export * from './app/appActions';
export * from './account/accountActions';
export * from './events/eventActions';
export * from './nav/navActions';
export * from './message-list/messagesActions';
export * from './streamlist/streamsActions';
export * from './subscriptions/subscriptionsActions';
export * from './users/userListActions';

export const batchActions = (...actions) => ({
  type: BATCH_ACTIONS,
  actions,
});
