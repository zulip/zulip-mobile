/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { AppNavigationProp, AppNavigationRouteProp } from '../nav/AppNavigator';
import { Screen } from '../common';
import TimeItem from './TimeItem';
import timing from '../utils/timing';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'timing'>,
  route: AppNavigationRouteProp<'timing'>,
|}>;

export default class TimingScreen extends PureComponent<Props> {
  render() {
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
}
