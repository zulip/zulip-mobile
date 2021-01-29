/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Debug, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getSession } from '../selectors';
import { OptionRow, Screen } from '../common';
import { debugFlagToggle } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'debug'>,
  route: RouteProp<'debug', void>,

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
