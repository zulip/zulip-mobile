/* @flow */
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getRecentConversations } from '../selectors';
import ConversationsCard from './ConversationsCard';

export default connect(
  state => ({
    conversations: getRecentConversations(state),
  }),
  boundActions,
)(ConversationsCard);
