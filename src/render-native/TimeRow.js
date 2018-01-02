/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HALF_COLOR } from '../styles';
import { humanDate } from '../utils/date';

const styles = StyleSheet.create({
  row: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  line: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: HALF_COLOR,
  },
  time: {
    padding: 4,
    color: '#999',
  },
});

type Props = {
  timestamp: number,
};

export default class TimeRow extends PureComponent<Props> {
  props: Props;

  render() {
    const { timestamp } = this.props;
    const displayDate = humanDate(new Date(timestamp * 1000));

    return (
      <View style={styles.row}>
        <View style={styles.line} />
        <Text style={styles.time}>{displayDate}</Text>
        <View style={styles.line} />
      </View>
    );
  }
}
