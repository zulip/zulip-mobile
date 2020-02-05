/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import type { Dispatch, UserOrBot } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { Screen, ZulipButton, Label } from '../common';
import { IconPrivateChat } from '../common/Icons';
import { pmNarrowFromEmail } from '../utils/narrow';
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
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<{| ...NavigationStateRoute, params: {| userId: number |} |}>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class AccountDetailsScreen extends PureComponent<Props> {
  handleChatPress = () => {
    const { user, dispatch } = this.props;
    dispatch(doNarrow(pmNarrowFromEmail(user.email)));
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
  user: getUserForId(state, props.navigation.state.params.userId),
  isActive: getUserIsActive(state, props.navigation.state.params.userId),
}))(AccountDetailsScreen);
