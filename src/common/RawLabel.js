/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

import type { StyleObj } from '../types';

type Props = {
  text: string,
  style?: StyleObj,
};

export default class RawLabel extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  render() {
    const { styles } = this.context;
    const { text, style, ...restProps } = this.props;

    return (
      <Text style={[styles.label, style]} {...restProps}>
        {text}
      </Text>
    );
  }
}
