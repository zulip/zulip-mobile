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
  lastMessage: getLastMessageInActiveNarrow(state),
  narrow: getActiveNarrow(state),
  noMessages: getIfNoMessages(state),
  ownEmail: getOwnEmail(state),
  showMessagePlaceholders: getShowMessagePlaceholders(state),
}))(Chat);
