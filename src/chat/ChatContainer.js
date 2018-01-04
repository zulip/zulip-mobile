/* @flow */
import connectWithActions from '../connectWithActions';
import {
  getActiveNarrow,
  getIfNoMessages,
  getShowMessagePlaceholders,
  getLastMessageInActiveNarrow,
  getOwnEmail,
} from '../selectors';
import Chat from './Chat';

export default connectWithActions(state => ({
  isOnline: state.app.isOnline,
  showMessagePlaceholders: getShowMessagePlaceholders(state),
  narrow: getActiveNarrow(state),
  noMessages: getIfNoMessages(state),
  ownEmail: getOwnEmail(state),
  lastMessage: getLastMessageInActiveNarrow(state),
}))(Chat);
