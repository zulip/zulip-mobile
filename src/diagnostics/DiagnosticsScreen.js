/* @flow */
import React, { PureComponent } from 'react';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { OptionButton, OptionDivider, Screen } from '../common';

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
      </Screen>
    );
  }
}

export default connectWithActions(null)(DiagnosticsScreen);
