import { combineReducers } from 'redux';
import user from './user/userReducers';
import stream from './stream/streamReducers';
import errors from './error/errorReducers';
import realm from './realm/realmReducers';
import events from './events/eventReducers';
import nav from './nav/navReducers';

export default combineReducers({
  user,
  stream,
  errors,
  realm,
  events,
  nav,
});
