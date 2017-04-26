import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import styles from '../../styles';
import renderHtmlChildren from '../renderHtmlChildren';

const BULLET = '\u2022';

const customStyles = StyleSheet.create({
  liText: {
    flex: 1,
  }
});

export default ({ style, ...restProps }) => (
  <View style={style}>
    <Text style={styles.bullet}>{BULLET}</Text>
    <View style={customStyles.liText}>
      {renderHtmlChildren({ ...restProps })}
    </View>
  </View>
);
