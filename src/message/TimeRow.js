import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BORDER_COLOR } from '../common/styles';
import { humanDate } from '../utils/date';

const styles = StyleSheet.create({
  row: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  time: {
    padding: 4,
    color: '#999',
  },
});

export default class TimeRow extends React.PureComponent {

  props: {
    time: number,
  };

  render() {
    const { time } = this.props;

    return (
      <View style={styles.row}>
        <View style={styles.line} />
        <Text style={styles.time}>{humanDate(time)}</Text>
        <View style={styles.line} />
      </View>
    );
  }
}
