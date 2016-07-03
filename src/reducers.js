import {combineReducers} from 'redux';
import user from './user/userReducers';
import stream from './stream/streamReducers';

export default combineReducers({
  user,
  stream,
});
