/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import styles, { createStyleSheet } from '../styles';

const componentStyles = createStyleSheet({
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

type Props = $ReadOnly<{|
  style?: ViewStyleProp,
  children: Node,
  padding: boolean,
|}>;

/**
 * A layout component that centers wrapped components
 * horizontally and vertically.
 *
 * @prop [style] - Apply styles to wrapper component.
 * @prop children - Components to be centered.
 * @prop [padding] - Specifies if the components should be padded.
 */
export default class Centerer extends PureComponent<Props> {
  static defaultProps: {| padding: boolean |} = {
    padding: false,
  };

  render(): Node {
    const { children, padding, style } = this.props;

    return (
      <View style={[componentStyles.centerer, padding && styles.padding, style]}>
        <View style={componentStyles.inner}>{children}</View>
      </View>
    );
  }
}
