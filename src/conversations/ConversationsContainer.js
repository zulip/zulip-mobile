/* @flow */
import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getCurrentRealm } from '../account/accountSelectors';
import { getRecentConversations } from '../chat/chatSelectors';
import ConversationsCard from './ConversationsCard';

export default connect(
  state => ({
    realm: getCurrentRealm(state),
    narrow: state.chat.narrow,
    users: state.users,
    conversations: getRecentConversations(state),
  }),
  boundActions,
)(props => <ConversationsCard {...props} />);
