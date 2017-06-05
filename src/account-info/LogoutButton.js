/* @flow */
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { InitRouteAction } from '../types';
import boundActions from '../boundActions';
import { ZulipButton } from '../common';

const styles = StyleSheet.create({
  logoutButton: {
    flex: 1,
    margin: 8,
  },
});

class LogoutButton extends Component {

  props: {
    accounts: any[],
    initRoutes: InitRouteAction,
    logout: (accounts: any[]) => void
  };

  logout = () => {
    this.props.logout(this.props.accounts);
    // const accountsLoggedOut = this.props.accounts.slice();
    // accountsLoggedOut[0].apiKey = '';
    // TODO: this.props.initRoutes(getInitialRoutes(this.props.accounts));
  }

  render() {
    return (
      <ZulipButton
        style={styles.logoutButton}
        secondary
        text="Logout"
        onPress={this.logout}
      />
    );
  }
}

export default connect(
  (state) => ({
    accounts: state.accounts,
  }),
  boundActions,
)(LogoutButton);
