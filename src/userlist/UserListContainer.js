import React, { Component } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  logout,
} from '../user/userActions';

import UsersDrawer from './UsersDrawer';

// const serverPresenceToStatus = (status: string, timestamp: number) =>
//   (timestamp - Date.now() < 1000 ? status : 'offline');

class UserListContainer extends Component {

  render() {
    return (
      <UsersDrawer {...this.props} />
    );
  }
}

const mapStateToProps = (state) => ({
  filter: state.userlist.get('filter'),
  users: state.userlist.get('users'),
  presence: state.userlist.get('presence'),
});

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators({
    logout,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserListContainer);
