import React, { Component } from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Screen } from '../common';
import { getAuth } from '../account/accountSelectors';
import { getRecentConversations } from '../chat/chatSelectors';
import UserListCard from './UserListCard';

class UsersScreen extends Component {

  render() {
    return (
      <Screen title="Find User">
        <UserListCard {...this.props} />
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    ownEmail: getAuth(state).email,
    realm: getAuth(state).realm,
    users: state.userlist,
    conversations: getRecentConversations(state),
  }),
  boundActions
)(UsersScreen);
