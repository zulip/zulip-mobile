import { combineReducers } from 'redux';
import auth from './user/authReducers';
import user from './user/userReducers';
import stream from './stream/streamReducers';
import errors from './error/errorReducers';
import realm from './realm/realmReducers';
import events from './events/eventReducers';
import nav from './nav/navReducers';

export default combineReducers({
  auth,
  user,
  stream,
  errors,
  realm,
  events,
  nav,
});
