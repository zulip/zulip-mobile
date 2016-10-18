import React, { Component } from 'react';
import { bindActionCreators } from 'redux';

import { connect } from 'react-redux';
import { logout } from '../account/accountActions';
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

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    logout,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserListContainer);
