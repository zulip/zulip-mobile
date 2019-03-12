/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Dispatch } from '../types';
import { ZulipButton } from '../common';
import { logout, tryStopNotifications } from '../actions';

const styles = StyleSheet.create({
  logoutButton: {
    flex: 1,
    margin: 8,
  },
});

type Props = {|
  dispatch: Dispatch,
|};

class LogoutButton extends PureComponent<Props> {
  logout = () => {
    const { dispatch } = this.props;
    dispatch(tryStopNotifications());
    dispatch(logout());
  };
  render() {
    return (
      <ZulipButton style={styles.logoutButton} secondary text="Log out" onPress={this.logout} />
    );
  }
}

export default connect()(LogoutButton);
