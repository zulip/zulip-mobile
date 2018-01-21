/* @flow */
import connectWithActions from '../connectWithActions';
import { getPresence, getRecentConversations, getUsersByEmail } from '../selectors';
import ConversationsCard from './ConversationsCard';

export default connectWithActions(state => ({
  conversations: getRecentConversations(state),
  presences: getPresence(state),
  usersByEmail: getUsersByEmail(state),
}))(ConversationsCard);
