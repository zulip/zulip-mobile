/* @flow */
import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

import Timestamp from './Timestamp';

type Props = {
  from: string,
  timestamp: number,
  twentyFourHourTime: boolean,
};

export default class Subheader extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

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
