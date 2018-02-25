/* @flow */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { View } from 'react-native';

import type { StyleObj } from '../types';

type Props = {
  style?: StyleObj,
  children: ChildrenArray<*>,
};

export default class FlexView extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { children, ...restProps } = this.props;

    return (
      <View style={styles.flexed} {...restProps}>
        {children}
      </View>
    );
  }
}
