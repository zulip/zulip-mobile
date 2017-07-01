/* @flow */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { ZulipButton } from '../common';
import { getAuth } from '../account/accountSelectors';
import unregisterPush from '../api/unregisterPush';

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 8,
  },
});

class SwitchAccountButton extends Component {

  static contextTypes = {
    drawer: () => null,
  };

  shutdownPUSH = async () => {
    const { auth, deleteTokenPush, pushToken } = this.props;
    if (pushToken !== '') {
      await unregisterPush(auth, pushToken);
      deleteTokenPush();
    }
  }

  switchAccount = () => {
    this.shutdownPUSH();
    this.context.drawer.close();
    this.props.pushRoute('account');
  }

  render() {
    return (
      <ZulipButton
        style={styles.button}
        secondary
        text="Switch"
        onPress={this.switchAccount}
      />
    );
  }
}

export default connect(
  (state) => ({
    auth: getAuth(state),
    accounts: state.accounts,
    pushToken: state.realm.pushToken
  }),
  boundActions,
)(SwitchAccountButton);
