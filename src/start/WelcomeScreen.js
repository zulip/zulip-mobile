/* @flow */
import React, { PureComponent } from 'react';

import connectWithActions from '../connectWithActions';
import type { Actions } from '../types';
import { Screen, ViewPlaceholder, ZulipButton } from '../common';

type Props = {
  actions: Actions,
};

class WelcomeScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { actions } = this.props;
    return (
      <Screen title="Welcome!" centerContent padding>
        <ZulipButton
          text="I have a Zulip account"
          onPress={() => actions.navigateToAddNewAccount('')}
        />
        <ViewPlaceholder height={20} />
        <ZulipButton text="I am new to Zulip" onPress={() => actions.navigateToWelcomeHelp()} />
      </Screen>
    );
  }
}

export default connectWithActions()(WelcomeScreen);
