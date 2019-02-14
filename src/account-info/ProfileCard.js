/* @flow strict-local */
import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Dispatch, GlobalState, User } from '../types';
import { getSelfUserDetail } from '../selectors';
import { ZulipButton } from '../common';
import { navigateToUserStatus } from '../actions';
import AccountDetails from './AccountDetails';
import AwayStatusSwitch from './AwayStatusSwitch';
import SwitchAccountButton from './SwitchAccountButton';
import LogoutButton from './LogoutButton';

const componentStyles = StyleSheet.create({
  accountButtons: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  setStatusButton: {
    marginHorizontal: 16,
  },
});

type Props = {|
  dispatch: Dispatch,
  selfUserDetail: User,
|};

/**
 * This is similar to `AccountDetails` but used to show the current users account.
 * It does not have a 'Send private message` but has `Switch` and `Logout` buttons.
 *
 * The user can still open `AccountDetails` on themselves via the (i) icon in a chat screen.
 */
class ProfileCard extends PureComponent<Props> {
  handleSetUserStatus = () => {
    const { dispatch } = this.props;
    dispatch(navigateToUserStatus());
  };

  render() {
    const { selfUserDetail } = this.props;

    return (
      <ScrollView>
        <AccountDetails user={selfUserDetail} />
        <AwayStatusSwitch />
        <ZulipButton
          style={componentStyles.setStatusButton}
          secondary
          text="Set a status"
          onPress={this.handleSetUserStatus}
        />
        <View style={componentStyles.accountButtons}>
          <SwitchAccountButton />
          <LogoutButton />
        </View>
      </ScrollView>
    );
  }
}

export default connect((state: GlobalState) => ({
  selfUserDetail: getSelfUserDetail(state),
}))(ProfileCard);
