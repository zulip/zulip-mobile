import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getInitialRoutes } from '../nav/routingSelectors';
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
  };

  logout = () => {
    this.props.logout(this.props.accounts);
    const accountsLoggedOut = this.props.accounts.slice();
    accountsLoggedOut[0].apiKey = '';
    this.props.initRoutes(getInitialRoutes(this.props.accounts));
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
