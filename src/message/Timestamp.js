import React from 'react';
import moment from 'moment';

import {
  StyleSheet,
  Text,
} from 'react-native';

const styles = StyleSheet.create({
  time: {
    color: '#999',
    fontSize: 15,
  },
});

export default class Timestamp extends React.PureComponent {

  props: {
    timestamp: number,
    twentyFourHourTime: bool,
  }

  renderTimestamp(twentyFourHourTime, timestamp) {
    const timeFormat = twentyFourHourTime ? 'H:MM' : 'h:MM A';
    return moment(timestamp * 1000).format(timeFormat);
  }

  render() {
    const { timestamp, twentyFourHourTime } = this.props;
    return (
      <Text style={styles.time}>
        {this.renderTimestamp(twentyFourHourTime, timestamp)}
      </Text>
    );
  }
}
