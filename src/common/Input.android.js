import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { CONTROL_SIZE } from './styles';

const styles = StyleSheet.create({
  input: {
    height: CONTROL_SIZE,
  },
});

export default (props) => (
  <TextInput
    style={[styles.input, props.customStyle]}
    {...props}
  />
);
