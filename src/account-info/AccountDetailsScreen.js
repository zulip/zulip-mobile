/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Dispatch, GlobalState, User } from '../types';
import { getAccountDetailsUserFromEmail } from '../selectors';
import { Screen, ZulipButton } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { privateNarrow } from '../utils/narrow';
import AccountDetails from './AccountDetails';
import { doNarrow } from '../actions';

const componentStyles = StyleSheet.create({
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
          style={componentStyles.pmButton}
          text="Send private message"
          onPress={this.handleChatPress}
          Icon={IconPrivateChat}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState, props) => ({
  user: getAccountDetailsUserFromEmail(state, props.navigation.state.params.email),
}))(AccountDetailsScreen);
