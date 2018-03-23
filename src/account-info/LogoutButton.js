/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Actions, Auth } from '../types';
import connectWithActions from '../connectWithActions';
import { ZulipButton } from '../common';
import { unregisterPush } from '../api';
import { getAuth, getPushToken } from '../selectors';
import { logErrorRemotely } from '../utils/logging';

const styles = StyleSheet.create({
  logoutButton: {
    flex: 1,
    margin: 8,
  },
});

type Props = {
  auth: Auth,
  pushToken: string,
  actions: Actions,
};

class LogoutButton extends PureComponent<Props> {
  props: Props;

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
    const { actions } = this.props;
    this.shutdownPUSH();
    actions.logout();
  };

  render() {
    return (
      <ZulipButton style={styles.logoutButton} secondary text="Logout" onPress={this.logout} />
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  pushToken: getPushToken(state),
}))(LogoutButton);
