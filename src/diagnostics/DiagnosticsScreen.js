/* @flow strict-local */

import React, { PureComponent } from 'react';
import { nativeApplicationVersion } from 'expo-application';

import type { AppNavigationProp, AppNavigationRouteProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
import { OptionButton, OptionDivider, Screen, RawLabel } from '../common';
import {
  navigateToDebug,
  navigateToStorage,
  navigateToTiming,
  navigateToVariables,
} from '../actions';

const styles = createStyleSheet({
  versionLabel: {
    textAlign: 'center',
    padding: 8,
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'diagnostics'>,
  route: AppNavigationRouteProp<'diagnostics'>,
|}>;

export default class DiagnosticsScreen extends PureComponent<Props> {
  render() {
    return (
      <Screen title="Diagnostics">
        <RawLabel style={styles.versionLabel} text={`v${nativeApplicationVersion ?? '?.?.?'}`} />
        <OptionDivider />
        <OptionButton
          label="Variables"
          onPress={() => {
            NavigationService.dispatch(navigateToVariables());
          }}
        />
        <OptionButton
          label="Timing"
          onPress={() => {
            NavigationService.dispatch(navigateToTiming());
          }}
        />
        <OptionButton
          label="Storage"
          onPress={() => {
            NavigationService.dispatch(navigateToStorage());
          }}
        />
        <OptionButton
          label="Debug"
          onPress={() => {
            NavigationService.dispatch(navigateToDebug());
          }}
        />
      </Screen>
    );
  }
}
