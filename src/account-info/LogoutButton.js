/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Auth, Dispatch, GlobalState } from '../types';
import { ZulipButton } from '../common';
import { unregisterPush } from '../api';
import { getAuth, getPushToken } from '../selectors';
import { logErrorRemotely } from '../utils/logging';
import { deleteTokenPush, logout } from '../actions';

const styles = StyleSheet.create({
  logoutButton: {
    flex: 1,
    margin: 8,
  },
});

type Props = {
  auth: Auth,
  pushToken: string,
  dispatch: Dispatch,
};

class LogoutButton extends PureComponent<Props> {
  props: Props;

  shutdownPUSH = async () => {
    const { auth, dispatch, pushToken } = this.props;
    if (pushToken !== '') {
      try {
        await unregisterPush(auth, pushToken);
      } catch (e) {
        logErrorRemotely(e, 'failed to unregister Push token');
      }
      dispatch(deleteTokenPush());
    }
  };

  logout = () => {
    const { dispatch } = this.props;
    this.shutdownPUSH();
    dispatch(logout());
  };

  render() {
    return (
      <ZulipButton style={styles.logoutButton} secondary text="Logout" onPress={this.logout} />
    );
  }
}

export default connect((state: GlobalState) => ({
  auth: getAuth(state),
  pushToken: getPushToken(state),
}))(LogoutButton);
