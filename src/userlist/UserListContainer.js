import React, { Component } from 'react';
import { connect } from 'react-redux';

import { pushRoute } from '../nav/navActions';
import { getAuth } from '../account/accountSelectors';
import { getRecentConversations } from '../chat/chatSelectors';
import UserListCard from './UserListCard';

class UserListContainer extends Component {

  render() {
    return (
      <UserListCard {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  ownEmail: getAuth(state).email,
  realm: getAuth(state).realm,
  users: state.userlist,
  conversations: getRecentConversations(state),
});

export default connect(mapStateToProps, {
  pushRoute,
})(UserListContainer);
