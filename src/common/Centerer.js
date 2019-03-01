/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Node as React$Node } from 'react';
import type { Style } from '../types';
import styles from '../styles';

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

type Props = {|
  style?: Style,
  children: React$Node,
  padding: boolean,
|};

/**
 * A layout component that centers wrapped components
 * horizontally and vertically.
 *
 * @prop [style] - Apply styles to wrapper component.
 * @prop children - Components to be centered.
 * @prop [padding] - Specifies if the components should be padded.
 */
export default class Centerer extends PureComponent<Props> {
  static defaultProps = {
    padding: false,
  };

  render() {
    const { children, padding, style } = this.props;

    return (
      <View style={[componentStyles.centerer, padding && styles.padding, style]}>
        <View style={componentStyles.inner}>{children}</View>
      </View>
    );
  }
}
