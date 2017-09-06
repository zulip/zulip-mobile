/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import format from 'date-fns/format';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

import { RawLabel } from '../common';

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

export default class TimeItem extends PureComponent {
  props: {
    text: string,
    start: Date,
    end: Date,
  };

  render() {
    const { text, start, end } = this.props;
    const startStr = format(start, 'HH:mm:ss'); // eslint-disable-line
    const durationStr = differenceInMilliseconds(end, start);
    const timingStr = `Start: ${startStr}   Duration: ${durationStr} ms`;

    return (
      <View style={styles.item}>
        <RawLabel style={styles.label} text={text} />
        <RawLabel style={styles.value} text={timingStr} />
      </View>
    );
  }
}
