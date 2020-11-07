/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Debug, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getSession } from '../selectors';
import { OptionRow, Screen } from '../common';
import { debugFlagToggle } from '../actions';

type Props = $ReadOnly<{|
  // Since we've put this screen in AppNavigator's route config, and
  // we don't invoke it without type-checking anywhere else (in fact,
  // we don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the particular shape for this
  // route.
  navigation: AppNavigationProp<'debug'>,

  debug: Debug,
  dispatch: Dispatch,
|}>;

class DebugScreen extends PureComponent<Props> {
  handleSettingToggle = (key: string) => {
    const { debug, dispatch } = this.props;
    dispatch(debugFlagToggle(key, !debug[key]));
  };

  render() {
    const { debug } = this.props;

    return (
      <Screen title="Debug">
        <OptionRow
          label="Do not mark messages read on scroll"
          value={debug.doNotMarkMessagesAsRead}
          onValueChange={() => this.handleSettingToggle('doNotMarkMessagesAsRead')}
        />
      </Screen>
    );
  }
}

export default connect(state => ({
  debug: getSession(state).debug,
}))(DebugScreen);
