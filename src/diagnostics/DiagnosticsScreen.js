/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { nativeApplicationVersion } from 'expo-application';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
import { NestedNavRow, OptionDivider, Screen, RawLabel } from '../common';
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
  route: RouteProp<'diagnostics', void>,
|}>;

export default class DiagnosticsScreen extends PureComponent<Props> {
  render(): Node {
    return (
      <Screen title="Diagnostics">
        <RawLabel style={styles.versionLabel} text={`v${nativeApplicationVersion ?? '?.?.?'}`} />
        <OptionDivider />
        <NestedNavRow
          label="Variables"
          onPress={() => {
            NavigationService.dispatch(navigateToVariables());
          }}
        />
        <NestedNavRow
          label="Timing"
          onPress={() => {
            NavigationService.dispatch(navigateToTiming());
          }}
        />
        <NestedNavRow
          label="Storage"
          onPress={() => {
            NavigationService.dispatch(navigateToStorage());
          }}
        />
        <NestedNavRow
          label="Debug"
          onPress={() => {
            NavigationService.dispatch(navigateToDebug());
          }}
        />
      </Screen>
    );
  }
}
