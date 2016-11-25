import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { getInitialRoutes } from '../nav/routingSelectors';
import { Button } from '../common';

const styles = StyleSheet.create({
  logoutButton: {
    marginTop: 10,
  },
});

class LogoutButton extends Component {

  props: {
    accounts: any[],
  };

  logout = () => {
    this.props.logout(this.props.accounts);
    const accoutsLoggedOut = this.props.accounts.slice();
    accoutsLoggedOut[0].apiKey = '';
    this.props.initRoutes(getInitialRoutes(this.props.accounts));
  }

  render() {
    return (
      <Button
        customStyles={styles.logoutButton}
        secondary
        text="Logout"
        onPress={this.logout}
      />
    );
  }
}

export default connect(
  (state) => ({
    accounts: state.account,
  }),
  boundActions,
)(LogoutButton);
