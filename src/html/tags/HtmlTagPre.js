/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { StyleObj } from '../../types';
import HtmlTagSpan from './HtmlTagSpan';

export default class HtmlTagPre extends PureComponent {
  props: {
    style: StyleObj,
    cascadingStyle: StyleObj,
  };

  render() {
    const { style, ...restProps } = this.props;

    return (
      <View style={style}>
        <HtmlTagSpan {...restProps} />
      </View>
    );
  }
}
