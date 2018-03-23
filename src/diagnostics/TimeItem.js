/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import format from 'date-fns/format';
import type { TimingItemType } from '../types';

import { RawLabel } from '../common';
import { numberWithSeparators } from '../utils/misc';

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(127, 127, 127, 0.25)',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    opacity: 0.9,
  },
});

export default class TimeItem extends PureComponent<TimingItemType> {
  props: TimingItemType;

  render() {
    const { text, start, end } = this.props;
    const startStr = format(start, 'HH:mm:ss.S'); // eslint-disable-line
    const durationStr = numberWithSeparators((end - start).toFixed(2));
    const timingStr = `Start: ${startStr}   Duration: ${durationStr} ms`;

    return (
      <View style={styles.item}>
        <RawLabel style={styles.label} text={text} />
        <RawLabel style={styles.value} text={timingStr} />
      </View>
    );
  }
}
