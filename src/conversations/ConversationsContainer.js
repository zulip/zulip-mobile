/* @flow */
import connectWithActions from '../connectWithActions';
import { getLoading, getRecentConversations, getUsersByEmail } from '../selectors';
import ConversationsCard from './ConversationsCard';

export default connectWithActions(state => ({
  conversations: getRecentConversations(state),
  isLoading: getLoading(state).users,
  usersByEmail: getUsersByEmail(state),
}))(ConversationsCard);
