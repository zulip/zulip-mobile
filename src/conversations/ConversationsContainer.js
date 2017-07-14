/* @flow */
import React from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getCurrentRealm, getRecentConversations } from '../selectors';
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
