/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import { Screen } from '../common';
import TimeItem from './TimeItem';
import timing from '../utils/timing';

export default class TimingScreen extends PureComponent<{}> {
  render() {
    return (
      <Screen title="Timing">
        <FlatList
          data={timing.log}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <TimeItem text={item.text} start={item.start} end={item.end} />}
        />
      </Screen>
    );
  }
}
