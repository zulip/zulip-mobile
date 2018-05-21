/* @flow */
import connectWithActions from '../connectWithActions';
import {
  getLoading,
  getPresence,
  getUnreadConversations,
  getUsersByEmail,
  getUnreadStreamsAndTopicsSansMuted,
} from '../selectors';
import UnreadCards from './UnreadCards';

export default connectWithActions(state => ({
  isLoading: getLoading(state).unread,
  conversations: getUnreadConversations(state),
  presences: getPresence(state),
  usersByEmail: getUsersByEmail(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopicsSansMuted(state),
}))(UnreadCards);
