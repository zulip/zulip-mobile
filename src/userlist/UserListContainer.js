import React, { Component } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  logout,
} from '../account/userActions';

import UsersCard from './UsersCard';

class UserListContainer extends Component {

  render() {
    return (
      <UsersCard {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  ownEmail: state.auth.get('email'),
  users: state.userlist,
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    logout,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserListContainer);
