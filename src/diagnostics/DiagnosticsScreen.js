/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { OptionButton, OptionDivider, Screen, RawLabel } from '../common';

const styles = StyleSheet.create({
  versionLabel: {
    textAlign: 'center',
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
    const { actions } = this.props;

    return (
      <Screen title="Diagnostics">
        <RawLabel style={styles.versionLabel} text={`v${DeviceInfo.getVersion()}`} />
        <OptionDivider />
        <OptionButton label="Variables" onPress={actions.navigateToVariables} />
        <OptionButton label="Timing" onPress={actions.navigateToTiming} />
        <OptionButton label="Storage" onPress={actions.navigateToStorage} />
        <OptionButton label="Debug" onPress={actions.navigateToDebug} />
        <OptionButton label="Notifications" onPress={actions.navigateToNotifDiag} />
      </Screen>
    );
  }
}

export default connectWithActions(null)(DiagnosticsScreen);
