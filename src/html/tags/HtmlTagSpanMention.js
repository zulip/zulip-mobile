/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions, StyleObj } from '../../types';
import renderHtmlChildren from '../renderHtmlChildren';
import styles from '../HtmlStyles';

export default class HtmlTagSpan extends PureComponent {
  props: {
    style?: StyleObj,
    actions?: Actions,
    cascadingStyle?: StyleObj,
    attribs?: Object,
  };

  render() {
    const { style, cascadingStyle, ...restProps } = this.props;
    return (
      <View style={[style, cascadingStyle, styles['user-mention-me']]}>
        {renderHtmlChildren({ ...restProps })}
      </View>
    );
  }
}
