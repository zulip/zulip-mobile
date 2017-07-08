/* @flow */
import React, { PureComponent } from 'react';
import { View, ScrollView } from 'react-native';

import type { Actions, StyleObj } from '../../types';
import renderHtmlChildren from '../renderHtmlChildren';

export default class HtmlTagDiv extends PureComponent {
  props: {
    style: StyleObj,
    actions: Actions,
  };

  render() {
    const { style, className, ...restProps } = this.props;
    const WrapperView = (className === 'codehilite') ? ScrollView : View;
    return (
      <WrapperView style={style} horizontal>
        {renderHtmlChildren({ ...restProps })}
      </WrapperView>
    );
  }
}
