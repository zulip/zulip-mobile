import { combineReducers } from 'redux';
import auth from './user/authReducers';
import user from './user/userReducers';
import stream from './stream/streamReducers';
import errors from './error/errorReducers';

export default combineReducers({
  auth,
  user,
  stream,
  errors,
});
