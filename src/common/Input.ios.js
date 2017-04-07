import React from 'react';
import {StyleSheet, TextInput} from 'react-native';

import {CONTROL_SIZE} from './platform';
import {BORDER_COLOR} from './styles';

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    height: CONTROL_SIZE,
    flexBasis: CONTROL_SIZE,
    borderColor: BORDER_COLOR,
    padding: 8,
  },
});

export default props => (
  <TextInput style={[styles.input, props.customStyle]} {...props} />
);
