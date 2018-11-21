/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Auth, Dispatch, GlobalState } from '../types';
import { ZulipButton } from '../common';
import { getAuth, getPushToken } from '../selectors';
import { unregisterPush } from '../api';
import { logErrorRemotely } from '../utils/logging';
import { deleteTokenPush, navigateToAccountPicker } from '../actions';

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 8,
  },
});

type Props = {
  auth: Auth,
  dispatch: Dispatch,
  pushToken: string,
};

class SwitchAccountButton extends PureComponent<Props> {
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

  switchAccount = () => {
    const { dispatch } = this.props;
    this.shutdownPUSH();
    dispatch(navigateToAccountPicker());
  };

  render() {
    return (
      <ZulipButton style={styles.button} secondary text="Switch" onPress={this.switchAccount} />
    );
  }
}

export default connect((state: GlobalState) => ({
  auth: getAuth(state),
  pushToken: getPushToken(state),
}))(SwitchAccountButton);
