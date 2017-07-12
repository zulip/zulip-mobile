/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Actions, StyleObj } from '../../types';
import renderHtmlChildren from '../renderHtmlChildren';

export default class HtmlTagDiv extends PureComponent {
  props: {
    style: StyleObj,
    actions: Actions,
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
