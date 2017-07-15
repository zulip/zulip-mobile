/* @flow */
import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

import Timestamp from './Timestamp';

export default class Subheader extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    from: string,
    timestamp: number,
    twentyFourHourTime: boolean,
  };

  render() {
    const { styles } = this.context;
    const { timestamp, twentyFourHourTime, from } = this.props;

    return (
      <View style={styles.subheader}>
        <Text style={[styles.username, styles.color]} numberOfLines={1}>
          {from}
        </Text>
        <Timestamp timestamp={timestamp} twentyFourHourTime={twentyFourHourTime} />
      </View>
    );
  }
}
