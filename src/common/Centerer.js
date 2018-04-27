/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ChildrenArray, StyleObj } from '../types';

const componentStyles = StyleSheet.create({
  centerer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 480,
  },
});

type Props = {
  style?: StyleObj,
  children: ChildrenArray<*>,
  padding: boolean,
};

export default class Centerer extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    padding: false,
  };

  render() {
    const { styles } = this.context;
    const { children, padding, style } = this.props;

    return (
      <View style={[componentStyles.centerer, padding && styles.padding, style]}>
        <View style={componentStyles.inner}>{children}</View>
      </View>
    );
  }
}
