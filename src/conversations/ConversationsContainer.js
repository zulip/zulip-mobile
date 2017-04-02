import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getAuth } from '../account/accountSelectors';
import { getRecentConversations } from '../chat/chatSelectors';
import ConversationsCard from './ConversationsCard';

export default connect(
  state => ({
    realm: getAuth(state).realm,
    narrow: state.chat.narrow,
    users: state.users,
    conversations: getRecentConversations(state),
  }),
  boundActions,
)(props => <ConversationsCard {...props} />);
