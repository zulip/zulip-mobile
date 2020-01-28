/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Dispatch, GlobalState, User } from '../types';
import { connectFlowFixMe } from '../react-redux';
import { getAccountDetailsUserForEmail } from '../selectors';
import { Screen, ZulipButton, Label } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { privateNarrow } from '../utils/narrow';
import AccountDetails from './AccountDetails';
import { doNarrow } from '../actions';
import { getUserIsActive } from '../users/userSelectors';

const styles = StyleSheet.create({
  pmButton: {
    marginHorizontal: 16,
  },
  deactivatedText: {
    textAlign: 'center',
    paddingBottom: 20,
    fontStyle: 'italic',
    fontSize: 18,
  },
});

type Props = $ReadOnly<{|
  user: User,
  isActive: boolean,
  dispatch: Dispatch,
|}>;

class AccountDetailsScreen extends PureComponent<Props> {
  handleChatPress = () => {
    const { user, dispatch } = this.props;
    dispatch(doNarrow(privateNarrow(user.email)));
  };

  render() {
    const { user, isActive } = this.props;
    const title = {
      text: '{_}',
      values: {
        // This causes the name not to get translated.
        _: user.full_name || ' ',
      },
    };

    return (
      <Screen title={title}>
        <AccountDetails user={user} />
        {!isActive && (
          <Label style={styles.deactivatedText} text="(This user has been deactivated)" />
        )}
        <ZulipButton
          style={styles.pmButton}
          text={isActive ? 'Send private message' : 'View private messages'}
          onPress={this.handleChatPress}
          Icon={IconPrivateChat}
        />
      </Screen>
    );
  }
}

export default connectFlowFixMe((state: GlobalState, props) => ({
  user: getAccountDetailsUserForEmail(state, props.navigation.state.params.email),
  isActive: getUserIsActive(state, props.navigation.state.params.email),
}))(AccountDetailsScreen);
