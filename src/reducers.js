import { combineReducers } from 'redux';
import account from './account/accountReducers';
import app from './app/appReducers';
import events from './events/eventReducers';
import nav from './nav/navReducers';
import realm from './realm/realmReducers';
import subscriptions from './subscriptions/subscriptionsReducers';
import chat from './chat/chatReducers';
import userlist from './users/userListReducers';

export default combineReducers({
  account,
  app,
  chat,
  events,
  nav,
  realm,
  subscriptions,
  userlist,
});
