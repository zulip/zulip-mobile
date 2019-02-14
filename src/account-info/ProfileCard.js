/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
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
});

type Props = {|
  dispatch: Dispatch,
  selfUserDetail: User,
|};

class ProfileCard extends PureComponent<Props> {
  handleSetUserStatus = () => {
    const { dispatch } = this.props;
    dispatch(navigateToUserStatus());
  };

  render() {
    const { selfUserDetail } = this.props;

    return (
      <View>
        <AccountDetails user={selfUserDetail} />
        <AwayStatusSwitch />
        <ZulipButton
          style={componentStyles.accountButtons}
          secondary
          text="Set a status"
          onPress={this.handleSetUserStatus}
        />
        <View style={componentStyles.accountButtons}>
          <SwitchAccountButton />
          <LogoutButton />
        </View>
      </View>
    );
  }
}

export default connect((state: GlobalState) => ({
  selfUserDetail: getSelfUserDetail(state),
}))(ProfileCard);
