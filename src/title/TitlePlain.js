import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { CONTROL_SIZE } from '../styles';

const styles = StyleSheet.create({
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    paddingRight: CONTROL_SIZE,
  },
});

export default ({ text, color }) =>
  <Text style={[styles.title, { color }]}>
    {text}
  </Text>;
