/* @flow */
import React, { PureComponent } from 'react';
import { View, ScrollView } from 'react-native';

import type { Actions, StyleObj } from '../../types';
import renderHtmlChildren from '../html/renderHtmlChildren';

type Props = {
  style: StyleObj,
  actions: Actions,
  className: string,
};

export default class HtmlTagDiv extends PureComponent<Props> {
  props: Props;

  render() {
    const { style, className, ...restProps } = this.props;
    const WrapperView = className === 'codehilite' ? ScrollView : View;
    return (
      <WrapperView contentContainerStyle={style} horizontal>
        {renderHtmlChildren({ ...restProps })}
      </WrapperView>
    );
  }
}
