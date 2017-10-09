/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Auth, Actions } from '../types';
import boundActions from '../boundActions';
import { ZulipButton } from '../common';
import { getAuth } from '../selectors';
import unregisterPush from '../api/unregisterPush';
import { logErrorRemotely } from '../utils/logging';

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 8,
  },
});

type Props = {
  auth: Auth,
  actions: Actions,
  pushToken: string,
};

class SwitchAccountButton extends PureComponent<Props> {
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

  switchAccount = () => {
    this.shutdownPUSH();
    this.props.actions.navigateToAccountPicker();
  };

  render() {
    return (
      <ZulipButton style={styles.button} secondary text="Switch" onPress={this.switchAccount} />
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
)(SwitchAccountButton);
