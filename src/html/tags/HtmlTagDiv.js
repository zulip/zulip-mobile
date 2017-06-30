/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { StyleObj } from '../../types';
import renderHtmlChildren from '../renderHtmlChildren';

export default class HtmlTagDiv extends PureComponent {

  props: {
    style: StyleObj,
  };

  render() {
    const { style, ...restProps } = this.props;

    return (
      <View style={style}>
        {renderHtmlChildren({ ...restProps })}
      </View>
    );
  }
}
