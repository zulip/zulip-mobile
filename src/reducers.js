import { combineReducers } from 'redux';
import accountlist from './accountlist/accountlistReducers';
import app from './account/appReducers';
import auth from './account/authReducers';
import errors from './error/errorReducers';
import events from './events/eventReducers';
import nav from './nav/navReducers';
import stream from './stream/streamReducers';
import subscriptions from './realm/subscriptionsReducers';
import user from './account/accountReducers';
import userlist from './userlist/userListReducers';

export default combineReducers({
  accountlist,
  app,
  auth,
  errors,
  events,
  nav,
  stream,
  subscriptions,
  user,
  userlist,
});
