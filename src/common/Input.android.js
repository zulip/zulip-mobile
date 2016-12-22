import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { FIELD_HEIGHT } from './styles';

const styles = StyleSheet.create({
  input: {
    height: FIELD_HEIGHT,
  },
});

export default (props) => (
  <TextInput
    style={[styles.input, props.customStyle]}
    {...props}
  />
);
