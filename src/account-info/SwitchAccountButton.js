/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Account, Dispatch, GlobalState } from '../types';
import { ZulipButton } from '../common';
import { getActiveAccount, getAccounts, getPushToken } from '../selectors';
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
  account: Account,
  dispatch: Dispatch,
  pushToken: string,
};

class SwitchAccountButton extends PureComponent<Props> {
  props: Props;

  shutdownPUSH = async () => {
    const { account, dispatch, pushToken } = this.props;
    if (pushToken !== '') {
      try {
        await unregisterPush(account, pushToken);
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
  account: getActiveAccount(state),
  accounts: getAccounts(state),
  pushToken: getPushToken(state),
}))(SwitchAccountButton);
