/* @flow */
import React from 'react';
import { View, Text } from 'react-native';

import styles from '../styles';
import Timestamp from './Timestamp';

export default class Subheader extends React.PureComponent {
  props: {
    from: string,
    timestamp: number,
    twentyFourHourTime: boolean,
  };

  render() {
    const { timestamp, twentyFourHourTime, from } = this.props;

    return (
      <View style={styles.subheader}>
        <Text
          style={[styles.username, styles.color]}
          numberOfLines={1}
        >
          {from}
        </Text>
        <Timestamp timestamp={timestamp} twentyFourHourTime={twentyFourHourTime} />
      </View>
    );
  }
}
