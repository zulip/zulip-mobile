/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Auth } from '../types';
import connectWithActions from '../connectWithActions';
import { ZulipButton } from '../common';
import { unregisterPush } from '../api';
import { getAuth, getPushToken } from '../selectors';
import { logErrorRemotely } from '../utils/logging';

type Props = {
  auth: Auth,
  pushToken: string,
  actions: Actions,
};

class LogoutButton extends PureComponent<Props> {
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

  logout = () => {
    const { actions } = this.props;
    this.shutdownPUSH();
    actions.logout();
  };

  render() {
    const { styles } = this.context;

    return (
      <ZulipButton style={styles.button} secondary text="Logout" onPress={this.logout} />
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  pushToken: getPushToken(state),
}))(LogoutButton);
