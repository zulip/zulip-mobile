/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { nativeApplicationVersion } from 'expo-application';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { createStyleSheet } from '../styles';
import NestedNavRow from '../common/NestedNavRow';
import OptionDivider from '../common/OptionDivider';
import Screen from '../common/Screen';
import ZulipText from '../common/ZulipText';

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

export default function DiagnosticsScreen(props: Props): Node {
  const { navigation } = props;
  return (
    <Screen title="Diagnostics">
      <ZulipText style={styles.versionLabel} text={`v${nativeApplicationVersion ?? '?.?.?'}`} />
      <OptionDivider />
      <NestedNavRow
        label="Variables"
        onPress={() => {
          navigation.push('variables');
        }}
      />
      <NestedNavRow
        label="Timing"
        onPress={() => {
          navigation.push('timing');
        }}
      />
      <NestedNavRow
        label="Storage"
        onPress={() => {
          navigation.push('storage');
        }}
      />
      <NestedNavRow
        label="Debug"
        onPress={() => {
          navigation.push('debug');
        }}
      />
    </Screen>
  );
}
