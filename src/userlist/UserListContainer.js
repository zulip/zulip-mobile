import React, { Component } from 'react';
import { connect } from 'react-redux';

import { pushRoute } from '../nav/navActions';
import { getAuth } from '../accountlist/accountlistSelectors';

import UserListCard from './UserListCard';

class UserListContainer extends Component {

  render() {
    return (
      <UserListCard {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  ownEmail: getAuth(state).get('email'),
  users: state.userlist,
});

export default connect(mapStateToProps, {
  pushRoute,
})(UserListContainer);
