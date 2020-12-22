/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import { Screen } from '../common';
import TimeItem from './TimeItem';
import timing from '../utils/timing';

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<NavigationStateRoute>,
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
