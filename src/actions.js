import { BATCH_ACTIONS } from './actionConstants';

export * from './app/appActions';
export * from './account/accountActions';
export * from './events/eventActions';
export * from './nav/navActions';
export * from './message/messagesActions';
export * from './realm/realmActions';
export * from './share/shareActions';
export * from './settings/settingsActions';
export * from './streamlist/streamsActions';
export * from './subscriptions/subscriptionsActions';
export * from './typing/typingActions';
export * from './users/usersActions';

export const batchActions = (...actions) => ({
  type: BATCH_ACTIONS,
  actions,
});
