/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Actions, Auth } from '../types';
import boundActions from '../boundActions';
import { ZulipButton } from '../common';
import unregisterPush from '../api/unregisterPush';
import { getAuth } from '../selectors';
import { logErrorRemotely } from '../utils/logging';

const styles = StyleSheet.create({
  logoutButton: {
    flex: 1,
    margin: 8,
  },
});

class LogoutButton extends PureComponent {
  props: {
    accounts: any[],
    auth: Auth,
    pushToken: string,
    actions: Actions,
  };

  shutdownPUSH = async () => {
    const { auth, actions, pushToken } = this.props;
    if (pushToken !== '') {
      try {
        await unregisterPush(auth, pushToken);
      } catch (e) {
        logErrorRemotely(e, 'failed to unregister Push token');
      }
      actions.deleteTokenPush();
    }
  };

  logout = () => {
    const { accounts, actions } = this.props;
    this.shutdownPUSH();
    actions.logout(accounts);
  };

  render() {
    return (
      <ZulipButton style={styles.logoutButton} secondary text="Logout" onPress={this.logout} />
    );
  }
}

export default connect(
  state => ({
    auth: getAuth(state),
    accounts: state.accounts,
    pushToken: state.realm.pushToken,
  }),
  boundActions,
)(LogoutButton);
