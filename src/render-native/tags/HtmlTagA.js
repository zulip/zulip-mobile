/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, StyleObj } from '../../types';
import styles from '../html/HtmlStyles';
import { Touchable } from '../../common';
import renderHtmlChildren from '../html/renderHtmlChildren';

type Props = {
  href: string,
  actions: Actions,
  cascadingStyle: StyleObj,
  onPress: (href: string) => void,
};

export default class HtmlTagA extends PureComponent<Props> {
  props: Props;

  render() {
    const { cascadingStyle, href, onPress, ...restProps } = this.props;
    return (
      <Touchable style={[styles.a, cascadingStyle]} onPress={() => onPress(href)}>
        {renderHtmlChildren({ href, ...restProps })}
      </Touchable>
    );
  }
}
