import {combineReducers} from 'redux';
import account from './account/loginReducers';
import stream from './stream/streamReducers';

export default combineReducers({
  account,
  stream,
});
