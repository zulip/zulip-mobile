/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { Screen } from '../common';
import OptionRow from '../settings/OptionRow';
import OptionButton from '../settings/OptionButton';

const styles = StyleSheet.create({
  divider: {
    height: 16,
  },
});

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
    const { actions, experimentalFeaturesEnabled } = this.props;

    return (
      <Screen title="Diagnostics">
        <OptionButton label="Variables" onPress={actions.navigateToVariables} />
        <View style={styles.divider} />
        <OptionButton label="Timing" onPress={actions.navigateToTiming} />
        <View style={styles.divider} />
        <OptionButton label="Storage" onPress={actions.navigateToStorage} />
        <View style={styles.divider} />
        <OptionRow
          label="Enable experimental features"
          defaultValue={experimentalFeaturesEnabled}
          onValueChange={this.handleExperimentalChange}
        />
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  experimentalFeaturesEnabled: state.settings.experimentalFeaturesEnabled,
}))(DiagnosticsScreen);
