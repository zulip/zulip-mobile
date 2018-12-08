/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import { Screen } from '../common';
import TimeItem from './TimeItem';
import timing from '../utils/timing';

export default class TimingScreen extends PureComponent<{}> {
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
