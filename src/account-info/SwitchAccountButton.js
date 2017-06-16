/* @flow */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { ZulipButton } from '../common';
import { getAuth } from '../account/accountSelectors';
import unregisterGCM from '../api/unregisterGCM';

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

  shutdownGCM = async () => {
    const { auth, deleteTokenGCM, gcmToken } = this.props;
    if (gcmToken !== '') {
      await unregisterGCM(auth, gcmToken);
      deleteTokenGCM();
    }
  }

  switchAccount = () => {
    this.shutdownGCM();
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
    gcmToken: state.realm.gcmToken
  }),
  boundActions,
)(SwitchAccountButton);
