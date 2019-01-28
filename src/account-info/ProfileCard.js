/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { GlobalState, User } from '../types';
import { getSelfUserDetail } from '../selectors';
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
  selfUserDetail: User,
|};

class ProfileCard extends PureComponent<Props> {
  render() {
    const { selfUserDetail } = this.props;

    return (
      <View>
        <AccountDetails user={selfUserDetail} />
        <AwayStatusSwitch />
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
