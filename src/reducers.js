import { combineReducers } from 'redux';
import user from './user/userReducers';
import stream from './stream/streamReducers';
import errors from './error/errorReducers';
import realm from './realm/realmReducers';
import events from './events/eventReducers';

export default combineReducers({
  user,
  stream,
  errors,
  realm,
  events,
});
