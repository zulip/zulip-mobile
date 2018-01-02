/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions, StyleObj } from '../../types';
import renderHtmlChildren from '../html/renderHtmlChildren';

type Props = {
  style?: StyleObj,
  actions?: Actions,
  cascadingStyle?: StyleObj,
};

export default class HtmlTagSpan extends PureComponent<Props> {
  props: Props;

  render() {
    const { style, cascadingStyle, ...restProps } = this.props;

    return <View style={[style, cascadingStyle]}>{renderHtmlChildren({ ...restProps })}</View>;
  }
}
