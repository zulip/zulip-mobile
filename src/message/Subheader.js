/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { RawLabel } from '../common';
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
        <RawLabel style={[styles.username]} text={from} numberOfLines={1} />
        <Timestamp timestamp={timestamp} twentyFourHourTime={twentyFourHourTime} />
      </View>
    );
  }
}
