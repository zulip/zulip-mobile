/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'debug'>,
  route: RouteProp<'debug', void>,
|}>;

export default function DebugScreen(props: Props): Node {
  return (
    <Screen title="Debug">
      <View />
    </Screen>
  );
}
