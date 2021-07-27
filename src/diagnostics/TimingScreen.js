/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { Screen } from '../common';
import TimeItem from './TimeItem';
import timing from '../utils/timing';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'timing'>,
  route: RouteProp<'timing', void>,
|}>;

export default function TimingScreen(props: Props): Node {
  return (
    <Screen title="Timing" scrollEnabled={false}>
      <FlatList
        data={timing.log}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TimeItem text={item.text} startMs={item.startMs} endMs={item.endMs} />
        )}
      />
    </Screen>
  );
}
