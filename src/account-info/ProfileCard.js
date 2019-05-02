/* @flow strict-local */
import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { Dispatch, User } from '../types';
import { connect } from '../react-redux';
import { getSelfUserDetail } from '../selectors';
import { ZulipButton } from '../common';
import {
  logout,
  tryStopNotifications,
  navigateToAccountPicker,
  navigateToUserStatus,
} from '../actions';
import AccountDetails from './AccountDetails';
import AwayStatusSwitch from './AwayStatusSwitch';

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  button: {
    flex: 1,
    margin: 8,
  },
});

type Props = {|
  dispatch: Dispatch,
  selfUserDetail: User,
|};

/**
 * This is similar to `AccountDetails` but used to show the current users account.
 * It does not have a "Send private message" but has "Switch account" and "Log out" buttons.
 *
 * The user can still open `AccountDetails` on themselves via the (i) icon in a chat screen.
 */
class ProfileCard extends PureComponent<Props> {
  handleSetStatusPress = () => {
    const { dispatch } = this.props;
    dispatch(navigateToUserStatus());
  };

  handleSwitchAccountPress = () => {
    const { dispatch } = this.props;
    dispatch(navigateToAccountPicker());
  };

  handleLogoutPress = () => {
    const { dispatch } = this.props;
    dispatch(tryStopNotifications());
    dispatch(logout());
  };

  render() {
    const { selfUserDetail } = this.props;

    return (
      <ScrollView>
        <AccountDetails user={selfUserDetail} />
        <AwayStatusSwitch />
        <View style={styles.buttonRow}>
          <ZulipButton
            style={styles.button}
            secondary
            text="Set a status"
            onPress={this.handleSetStatusPress}
          />
        </View>
        <View style={styles.buttonRow}>
          <ZulipButton
            style={styles.button}
            secondary
            text="Switch account"
            onPress={this.handleSwitchAccountPress}
          />
          <ZulipButton
            style={styles.button}
            secondary
            text="Log out"
            onPress={this.handleLogoutPress}
          />;
        </View>
      </ScrollView>
    );
  }
}

export default connect(state => ({
  selfUserDetail: getSelfUserDetail(state),
}))(ProfileCard);
