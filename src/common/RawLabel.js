/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

import type { StyleObj } from '../types';

export default class RawLabel extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  props: {
    text: string,
    style?: StyleObj,
  };

  render() {
    const styles = this.context.styles || {};
    const { text, style, ...restProps } = this.props;

    return (
      <Text style={[styles.label, style]} {...restProps}>
        {text}
      </Text>
    );
  }
}
