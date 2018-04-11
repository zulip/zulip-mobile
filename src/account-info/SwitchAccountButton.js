/* @flow */
import React, { PureComponent } from 'react';

import type { Auth, Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { ZulipButton } from '../common';
import { getAuth, getAccounts, getPushToken } from '../selectors';
import { unregisterPush } from '../api';
import { logErrorRemotely } from '../utils/logging';

type Props = {
  auth: Auth,
  actions: Actions,
  pushToken: string,
};

class SwitchAccountButton extends PureComponent<Props> {
  props: Props;
  static contextTypes = {
    styles: () => null,
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

  switchAccount = () => {
    this.shutdownPUSH();
    this.props.actions.navigateToAccountPicker();
  };

  render() {
    const { styles } = this.context;
    return (
      <ZulipButton style={styles.button} secondary text="Switch" onPress={this.switchAccount} />
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  accounts: getAccounts(state),
  pushToken: getPushToken(state),
}))(SwitchAccountButton);
