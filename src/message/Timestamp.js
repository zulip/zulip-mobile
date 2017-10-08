/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text } from 'react-native';

import { shortTime } from '../utils/date';

const styles = StyleSheet.create({
  time: {
    color: '#999',
    fontSize: 14,
    lineHeight: 14,
  },
});

type Props = {
  timestamp: number,
  twentyFourHourTime: boolean,
};

export default class Timestamp extends PureComponent<Props> {
  props: Props;

  render() {
    const { timestamp, twentyFourHourTime } = this.props;

    return (
      <Text style={styles.time}>{shortTime(new Date(timestamp * 1000), twentyFourHourTime)}</Text>
    );
  }
}
