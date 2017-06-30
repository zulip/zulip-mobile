/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { StyleObj } from '../../types';
import renderHtmlChildren from '../renderHtmlChildren';

export default class HtmlTagSpan extends PureComponent {

  props: {
    style?: StyleObj,
    cascadingStyle?: StyleObj,
  }

  render() {
    const { style, cascadingStyle, ...restProps } = this.props;

    return (
      <View style={[style, cascadingStyle]}>
        {renderHtmlChildren({ ...restProps })}
      </View>
    );
  }
}
