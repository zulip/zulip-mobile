import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { FIELD_HEIGHT } from './platform';
import { BORDER_COLOR } from './styles';

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    height: FIELD_HEIGHT,
    flexBasis: FIELD_HEIGHT,
    borderColor: BORDER_COLOR,
    padding: 10,
  },
});

export default (props) => (
  <TextInput
    style={[styles.input, props.customStyle]}
    {...props}
  />
);
