import { combineReducers } from 'redux';
import app from './user/appReducers';
import auth from './user/authReducers';
import user from './user/userReducers';
import userlist from './userlist/userListReducers';
import stream from './stream/streamReducers';
import errors from './error/errorReducers';
import events from './events/eventReducers';
import nav from './nav/navReducers';
import subscriptions from './realm/subscriptionsReducers';

export default combineReducers({
  app,
  auth,
  user,
  userlist,
  stream,
  errors,
  events,
  nav,
  subscriptions,
});
