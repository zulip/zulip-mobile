import React from 'react';
import { Text, View } from 'react-native';

import styles from '../../styles';
import renderHtmlChildren from './renderHtmlChildren';

const BULLET = '\u2022';

export default ({ style, ...restProps }) => (
  <View style={style}>
    <Text style={styles.bullet}>{BULLET}</Text>
    <Text>
      {renderHtmlChildren({ ...restProps })}
    </Text>
  </View>
);
