import React, { Component } from 'react';
import { TextInput } from 'react-native';

import styles, { HALF_COLOR } from '../styles';

export default class Input extends Component {
  props: {
    style: Object,
    restProps: any[],
  };

  render() {
    const { style, ...restProps } = this.props;

    return (
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={HALF_COLOR}
        {...restProps}
      />
    );
  }
}
