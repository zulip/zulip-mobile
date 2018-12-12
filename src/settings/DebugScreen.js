/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Debug, Dispatch, GlobalState } from '../types';
import { getSession } from '../selectors';
import { OptionRow, Screen } from '../common';
import { debugFlagToggle } from '../actions';

type Props = {|
  debug: Debug,
  dispatch: Dispatch,
|};

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
          label="Distinguish unread messages"
          defaultValue={debug.highlightUnreadMessages}
          onValueChange={() => this.handleSettingToggle('highlightUnreadMessages')}
        />
        <OptionRow
          label="Do not mark messages read on scroll"
          defaultValue={debug.doNotMarkMessagesAsRead}
          onValueChange={() => this.handleSettingToggle('doNotMarkMessagesAsRead')}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  debug: getSession(state).debug,
}))(DebugScreen);
