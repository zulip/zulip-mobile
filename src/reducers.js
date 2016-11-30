import { combineReducers } from 'redux';
import account from './account/accountReducers';
import app from './app/appReducers';
import events from './events/eventReducers';
import nav from './nav/navReducers';
import realm from './realm/realmReducers';
import stream from './stream/streamReducers';
import subscriptions from './subscriptions/subscriptionsReducers';
import userlist from './userlist/userListReducers';

export default combineReducers({
  account,
  app,
  events,
  nav,
  realm,
  stream,
  subscriptions,
  userlist,
});
