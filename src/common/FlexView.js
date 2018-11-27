/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { View } from 'react-native';

import type { Context, Style } from '../types';

type Props = {
  style?: Style,
  children: ChildrenArray<*>,
};

export default class FlexView extends PureComponent<Props> {
  context: Context;
  props: Props;

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
