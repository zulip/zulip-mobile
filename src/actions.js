/* @flow */
import { BATCH_ACTIONS } from './actionConstants';

export * from './app/appActions';
export * from './account/accountActions';
export * from './events/eventActions';
export * from './nav/navActions';
export * from './drafts/draftsActions';
export * from './message/messagesActions';
export * from './realm/realmActions';
export * from './outbox/outboxActions';
export * from './settings/settingsActions';
export * from './streams/streamsActions';
export * from './subscriptions/subscriptionsActions';
export * from './typing/typingActions';
export * from './users/usersActions';

export const batchActions = (...actions) => ({
  type: BATCH_ACTIONS,
  actions,
});
