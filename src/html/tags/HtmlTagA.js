/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, StyleObj } from '../../types';
import styles from '../HtmlStyles';
import { Touchable } from '../../common';
import renderHtmlChildren from '../renderHtmlChildren';

export default class HtmlTagA extends PureComponent {
  props: {
    href: string,
    actions: Actions,
    cascadingStyle: StyleObj,
    onPress: () => void,
  };

  render() {
    const { cascadingStyle, href, onPress, ...restProps } = this.props;
    return (
      <Touchable style={[styles.a, cascadingStyle]} onPress={() => onPress(href)}>
        {renderHtmlChildren({ href, ...restProps })}
      </Touchable>
    );
  }
}
