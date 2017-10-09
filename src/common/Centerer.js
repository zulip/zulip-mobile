/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';

const styles = StyleSheet.create({
  centerer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  padding: {
    padding: 20,
  },
  inner: {
    width: '100%',
    maxWidth: 480,
  },
});

type Props = {
  style?: StyleObj,
  children: React.ChildrenArray<any>,
  padding: boolean,
};

export default class Centerer extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    padding: false,
  };

  render() {
    const { children, style, padding } = this.props;

    return (
      <View style={[styles.centerer, padding && styles.padding, style]}>
        <View style={styles.inner}>{children}</View>
      </View>
    );
  }
}
