/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions, StyleObj } from '../../types';
import styles from '../html/HtmlStyles';
import renderHtmlChildren from '../html/renderHtmlChildren';

type Props = {
  style: StyleObj,
  actions: Actions,
  cascadingStyle: StyleObj,
};

export default class HtmlTagItalic extends PureComponent<Props> {
  props: Props;

  render() {
    const { cascadingStyle, ...restProps } = this.props;

    return (
      <View style={[styles.i, cascadingStyle]}>
        {renderHtmlChildren({ cascadingStyle, ...restProps })}
      </View>
    );
  }
}
