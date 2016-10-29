import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getAuth } from '../accountlist/accountlistSelectors';

import UsersCard from './UsersCard';

class UserListContainer extends Component {

  render() {
    return (
      <UsersCard {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  ownEmail: getAuth(state).get('email'),
  users: state.userlist,
});

export default connect(mapStateToProps)(UserListContainer);
