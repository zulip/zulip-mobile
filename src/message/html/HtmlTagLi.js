import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

import renderHtmlChildren from './renderHtmlChildren';

const styles = StyleSheet.create({
  bullet: {
    paddingLeft: 4,
    paddingRight: 8,
  },
});

const BULLET = '\u2022';

export default ({auth, childrenNodes, style, cascadingStyle}) => (
  <View style={style}>
    <Text style={styles.bullet}>{BULLET}</Text>
    <Text>{renderHtmlChildren({childrenNodes, auth, cascadingStyle})}</Text>
  </View>
);
