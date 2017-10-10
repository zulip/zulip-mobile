/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions } from '../types';
import connectWithActions from '../connectWithActions';
import { Screen } from '../common';
import OptionButton from '../settings/OptionButton';

const styles = StyleSheet.create({
  divider: {
    height: 16,
  },
});

type Props = {
  actions: Actions,
};

class DiagnosticsScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { actions } = this.props;

    return (
      <Screen title="Diagnostics">
        <OptionButton label="Variables" onPress={actions.navigateToVariables} />
        <View style={styles.divider} />
        <OptionButton label="Timing" onPress={actions.navigateToTiming} />
        <View style={styles.divider} />
        <OptionButton label="Storage" onPress={actions.navigateToStorage} />
      </Screen>
    );
  }
}

export default connectWithActions(null)(DiagnosticsScreen);
