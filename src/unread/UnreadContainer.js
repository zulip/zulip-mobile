/* @flow */
import connectWithActions from '../connectWithActions';
import {
  getLoading,
  getPresence,
  getUnreadConversations,
  getUsersByEmail,
  getUnreadStreamsAndTopics,
} from '../selectors';
import UnreadCards from './UnreadCards';

export default connectWithActions(state => ({
  isLoading: getLoading(state).unread,
  conversations: getUnreadConversations(state),
  presences: getPresence(state),
  usersByEmail: getUsersByEmail(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopics(state),
}))(UnreadCards);
