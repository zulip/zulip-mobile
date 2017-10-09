/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Screen } from '../common';
import OptionButton from '../settings/OptionButton';

const styles = StyleSheet.create({
  divider: {
    height: 16,
  },
});

class DiagnosticsScreen extends PureComponent {
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

export default connect(null, boundActions)(DiagnosticsScreen);
