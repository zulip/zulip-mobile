/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Dispatch, UserOrBot, UserId } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { Screen, ZulipButton, Label } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { pm1to1NarrowFromUser } from '../utils/narrow';
import AccountDetails from './AccountDetails';
import { doNarrow } from '../actions';
import { getUserIsActive, getUserForId } from '../users/userSelectors';

const styles = createStyleSheet({
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

type SelectorProps = $ReadOnly<{|
  isActive: boolean,
  user: UserOrBot,
|}>;

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'account-details'>,
  route: RouteProp<'account-details', {| userId: UserId |}>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class AccountDetailsScreen extends PureComponent<Props> {
  handleChatPress = () => {
    const { user, dispatch } = this.props;
    dispatch(doNarrow(pm1to1NarrowFromUser(user)));
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

export default connect<SelectorProps, _, _>((state, props) => ({
  user: getUserForId(state, props.route.params.userId),
  isActive: getUserIsActive(state, props.route.params.userId),
}))(AccountDetailsScreen);
