/* @flow */
import connectWithActions from '../connectWithActions';
import { getRecentConversations, getUsersByEmail } from '../selectors';
import ConversationsCard from './ConversationsCard';

export default connectWithActions(state => ({
  conversations: getRecentConversations(state),
  usersByEmail: getUsersByEmail(state),
}))(ConversationsCard);
