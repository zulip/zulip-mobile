import { combineReducers } from 'redux';
import user from './user/userReducers';
import stream from './stream/streamReducers';
import errors from './error/errorReducers';

export default combineReducers({
  user,
  stream,
  errors,
});
