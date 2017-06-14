/* @flow */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { InitRouteAction, Auth } from '../types';
import boundActions from '../boundActions';
import { getInitialRoutes } from '../nav/routingSelectors';
import { ZulipButton } from '../common';
import unregisterGCM from '../api/unregisterGCM';
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
    deleteTokenGCM: () => void,
    auth: Auth,
    gcmToken: string
  };

  logout = async () => {
    const { accounts, auth, deleteTokenGCM, gcmToken } = this.props;
    if (gcmToken !== '') {
      await unregisterGCM(auth, gcmToken);
      deleteTokenGCM();
    }
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
    gcmToken: state.realm.gcmToken
  }),
  boundActions,
)(LogoutButton);
