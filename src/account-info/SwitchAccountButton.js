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
  whiteBorder: {
    borderWidth: 1.3,
    borderColor: 'white',
  },
});

type Props = {|
  auth: Auth,
  dispatch: Dispatch,
  isOnCompatibilityScreen: boolean,
  pushToken: string,
|};

class SwitchAccountButton extends PureComponent<Props> {
  static defaultProps = {
    isOnCompatibilityScreen: false,
  };

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
    const { isOnCompatibilityScreen } = this.props;

    const buttonStyle = [styles.button];
    if (isOnCompatibilityScreen) {
      buttonStyle.push(styles.whiteBorder);
    }

    return (
      <ZulipButton
        style={buttonStyle}
        secondary={!isOnCompatibilityScreen}
        text={isOnCompatibilityScreen ? 'Or, pick another account' : 'Switch'}
        onPress={this.switchAccount}
      />
    );
  }
}

export default connect((state: GlobalState) => ({
  auth: getAuth(state),
  pushToken: getPushToken(state),
}))(SwitchAccountButton);
