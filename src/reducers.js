import { combineReducers } from 'redux';
import account from './account/accountReducers';
import app from './app/appReducers';
import events from './events/eventReducers';
import nav from './nav/navReducers';
import stream from './stream/streamReducers';
import subscriptions from './realm/subscriptionsReducers';
import userlist from './userlist/userListReducers';

export default combineReducers({
  account,
  app,
  events,
  nav,
  stream,
  subscriptions,
  userlist,
});
