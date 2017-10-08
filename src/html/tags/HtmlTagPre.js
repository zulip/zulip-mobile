/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { StyleObj } from '../../types';
import HtmlTagSpan from './HtmlTagSpan';

type Props = {
  style: StyleObj,
  cascadingStyle: StyleObj,
};

export default class HtmlTagPre extends PureComponent<Props> {
  props: Props;

  render() {
    const { style, ...restProps } = this.props;

    return (
      <View style={style}>
        <HtmlTagSpan {...restProps} />
      </View>
    );
  }
}
