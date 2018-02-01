/* @flow */
import React, { PureComponent } from 'react';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { OptionDivider, OptionRow, Screen } from '../common';

type Props = {
  actions: Actions,
  debug: Object,
};

class DebugScreen extends PureComponent<Props> {
  props: Props;

  handleSettingToggle = (key: string) => {
    const { actions, debug } = this.props;
    actions.debugFlagToggle(key, !debug[key]);
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
        <OptionDivider />
        <OptionRow
          label="Do not mark messages read on scroll"
          defaultValue={debug.doNotMarkMessagesAsRead}
          onValueChange={() => this.handleSettingToggle('doNotMarkMessagesAsRead')}
        />
        <OptionDivider />
        <OptionRow
          label="Split Message Text"
          defaultValue={debug.splitMessageText}
          onValueChange={() => this.handleSettingToggle('splitMessageText')}
        />
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  debug: state.app.debug,
}))(DebugScreen);
