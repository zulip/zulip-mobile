/* @flow */
import connectWithActions from '../connectWithActions';
import { getActiveNarrow, getIsFetching, getIfNoMessages } from '../selectors';
import Chat from './Chat';

export default connectWithActions(state => ({
  isOnline: state.app.isOnline,
  isFetching: getIsFetching(state),
  narrow: getActiveNarrow(state),
  noMessages: getIfNoMessages(state),
}))(Chat);
