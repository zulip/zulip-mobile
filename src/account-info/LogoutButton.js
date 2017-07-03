/* @flow */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { InitRouteAction, Auth } from '../types';
import boundActions from '../boundActions';
import { getInitialRoutes } from '../nav/routingSelectors';
import { ZulipButton } from '../common';
import unregisterPush from '../api/unregisterPush';
import { getAuth } from '../account/accountSelectors';

const styles = StyleSheet.create({
  logoutButton: {
    flex: 1,
    margin: 8,
  },
});

class LogoutButton extends Component {

  props: {
    accounts: any[],
    initRoutes: InitRouteAction,
    logout: (accounts: any[]) => void,
    deleteTokenPush: () => void,
    auth: Auth,
    pushToken: string,
  };

  shutdownPUSH = async () => {
    const { auth, deleteTokenPush, pushToken } = this.props;
    if (pushToken !== '') {
      await unregisterPush(auth, pushToken);
      deleteTokenPush();
    }
  }

  logout = () => {
    const { accounts } = this.props;
    this.shutdownPUSH();
    this.props.logout(accounts);
    const accountsLoggedOut = accounts.slice();
    accountsLoggedOut[0].apiKey = '';
    this.props.initRoutes(getInitialRoutes(accounts));
  }

  render() {
    return (
      <ZulipButton
        style={styles.logoutButton}
        secondary
        text="Logout"
        onPress={this.logout}
      />
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    accounts: state.accounts,
    pushToken: state.realm.pushToken
  }),
  boundActions,
)(LogoutButton);
