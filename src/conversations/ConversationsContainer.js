/* @flow */
import connectWithActions from '../connectWithActions';
import { getRecentConversations } from '../selectors';
import ConversationsCard from './ConversationsCard';

export default connectWithActions(state => ({
  conversations: getRecentConversations(state),
}))(ConversationsCard);
