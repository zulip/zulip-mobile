/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { ZulipButton } from '../common';
import { getAuth } from '../selectors';
import unregisterPush from '../api/unregisterPush';

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 8,
  },
});

class SwitchAccountButton extends PureComponent {
  shutdownPUSH = async () => {
    const { auth, actions, pushToken } = this.props;
    if (pushToken !== '') {
      try {
        await unregisterPush(auth, pushToken);
      } catch (e) {
        console.log('failed to unregister Push token', e); // eslint-disable-line
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
