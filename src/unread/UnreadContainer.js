/* @flow */
import connectWithActions from '../connectWithActions';
import {
  getPresence,
  getUnreadConversations,
  getUsersByEmail,
  getUnreadStreamsAndTopics,
} from '../selectors';
import UnreadCards from './UnreadCards';

export default connectWithActions(state => ({
  conversations: getUnreadConversations(state),
  presences: getPresence(state),
  usersByEmail: getUsersByEmail(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopics(state),
}))(UnreadCards);
