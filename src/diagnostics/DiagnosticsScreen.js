/* @flow */
import React, { PureComponent } from 'react';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { Screen } from '../common';
import OptionButton from '../settings/OptionButton';
import OptionDivider from '../settings/OptionDivider';

type Props = {
  actions: Actions,
  experimentalFeaturesEnabled: boolean,
};

class DiagnosticsScreen extends PureComponent<Props> {
  props: Props;

  handleExperimentalChange = () => {
    const { actions, experimentalFeaturesEnabled } = this.props;
    actions.settingsChange('experimentalFeaturesEnabled', !experimentalFeaturesEnabled);
  };

  handleSplitMessageTextChange = () => {
    const { actions, splitMessageText } = this.props;
    actions.settingsChange('splitMessageText', !splitMessageText);
  };

  render() {
    const { actions } = this.props;

    return (
      <Screen title="Diagnostics">
        <OptionButton label="Variables" onPress={actions.navigateToVariables} />
        <OptionDivider />
        <OptionButton label="Timing" onPress={actions.navigateToTiming} />
        <OptionDivider />
        <OptionButton label="Storage" onPress={actions.navigateToStorage} />
        <OptionDivider />
        <OptionButton label="Debug" onPress={actions.navigateToDebug} />
        <OptionButton
          label="Split Message Text"
          onValueChange={this.handleSplitMessageTextChange}
        />
      </Screen>
    );
  }
}

export default connectWithActions(null)(DiagnosticsScreen);
