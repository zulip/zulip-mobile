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
    time: number,
  }

  render() {
    const { time } = this.props;

    return (
      <Text style={styles.time}>
        {moment(time * 1000).format('LT')}
      </Text>
    );
  }
}
