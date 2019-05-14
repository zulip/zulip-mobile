/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Dispatch, GlobalState, User } from '../types';
import { connectFlowFixMe } from '../react-redux';
import { getAccountDetailsUserForEmail } from '../selectors';
import { Screen, ZulipButton } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { privateNarrow } from '../utils/narrow';
import AccountDetails from './AccountDetails';
import { doNarrow } from '../actions';

const styles = StyleSheet.create({
  pmButton: {
    marginHorizontal: 16,
  },
});

type Props = {|
  user: User,
  dispatch: Dispatch,
|};

class AccountDetailsScreen extends PureComponent<Props> {
  handleChatPress = () => {
    const { user, dispatch } = this.props;
    dispatch(doNarrow(privateNarrow(user.email)));
  };

  render() {
    const { user } = this.props;
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
        <ZulipButton
          style={styles.pmButton}
          text="Send private message"
          onPress={this.handleChatPress}
          Icon={IconPrivateChat}
        />
      </Screen>
    );
  }
}

export default connectFlowFixMe((state: GlobalState, props) => ({
  user: getAccountDetailsUserForEmail(state, props.navigation.state.params.email),
}))(AccountDetailsScreen);
