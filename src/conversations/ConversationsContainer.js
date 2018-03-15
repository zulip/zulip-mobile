/* @flow */
import connectWithActions from '../connectWithActions';
import { getLoading, getPresence, getRecentConversations, getUsersByEmail } from '../selectors';
import ConversationsCard from './ConversationsCard';

export default connectWithActions(state => ({
  conversations: getRecentConversations(state),
  isLoading: getLoading(state).users,
  presences: getPresence(state),
  usersByEmail: getUsersByEmail(state),
}))(ConversationsCard);
