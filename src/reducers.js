import { combineReducers } from 'redux';
import app from './account/appReducers';
import auth from './account/authReducers';
import user from './account/userReducers';
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
