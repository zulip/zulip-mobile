/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import { nativeApplicationVersion } from 'expo-application';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { OptionButton, OptionDivider, Screen, RawLabel } from '../common';
import {
  navigateToDebug,
  navigateToStorage,
  navigateToTiming,
  navigateToVariables,
} from '../actions';

const styles = StyleSheet.create({
  versionLabel: {
    textAlign: 'center',
    padding: 8,
  },
});

type Props = $ReadOnly<{|
  dispatch: Dispatch,
|}>;

class DiagnosticsScreen extends PureComponent<Props> {
  render() {
    const { dispatch } = this.props;

    return (
      <Screen title="Diagnostics">
        <RawLabel style={styles.versionLabel} text={`v${nativeApplicationVersion ?? '?.?.?'}`} />
        <OptionDivider />
        <OptionButton
          label="Variables"
          onPress={() => {
            dispatch(navigateToVariables());
          }}
        />
        <OptionButton
          label="Timing"
          onPress={() => {
            dispatch(navigateToTiming());
          }}
        />
        <OptionButton
          label="Storage"
          onPress={() => {
            dispatch(navigateToStorage());
          }}
        />
        <OptionButton
          label="Debug"
          onPress={() => {
            dispatch(navigateToDebug());
          }}
        />
      </Screen>
    );
  }
}

export default connect()(DiagnosticsScreen);
