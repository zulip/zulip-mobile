/* @flow */
import connectWithActions from '../connectWithActions';
import {
  getLoading,
  getPresence,
  getUnreadConversations,
  getAllUsersAndBotsByEmail,
  getUnreadStreamsAndTopicsSansMuted,
} from '../selectors';
import UnreadCards from './UnreadCards';

export default connectWithActions(state => ({
  isLoading: getLoading(state).unread,
  conversations: getUnreadConversations(state),
  presences: getPresence(state),
  usersByEmail: getAllUsersAndBotsByEmail(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopicsSansMuted(state),
}))(UnreadCards);
