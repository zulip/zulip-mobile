/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';
import { nativeApplicationVersion } from 'expo-application';

import type { Dispatch } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
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
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<NavigationStateRoute>,

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

export default connect<{||}, _, _>()(DiagnosticsScreen);
