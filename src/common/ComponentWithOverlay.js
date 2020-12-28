/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type { Node as React$Node } from 'react';

import { createStyleSheet } from '../styles';

const styles = createStyleSheet({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    overflow: 'hidden',
  },
  'top-right': {
    right: 0,
    top: 0,
  },
  'top-left': {
    left: 0,
    top: 0,
  },
  'bottom-right': {
    right: 0,
    bottom: 0,
  },
  'bottom-left': {
    bottom: 0,
    left: 0,
  },
});

type Props = $ReadOnly<{|
  children: React$Node,
  overlay: React$Node,
  showOverlay: boolean,
  overlaySize: number,
  overlayColor: string,
  overlayPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
  style?: ViewStyleProp,
|}>;

/**
 * Place an overlay, with a colored-disk background, on another component.
 *
 * @prop children - Main component to be rendered.
 * @prop overlay - Component to be overlayed over the main one.
 * @prop [showOverlay] - Should the overlay be shown.
 * @prop overlaySize - The size of the overlay in pixels.
 * @prop overlayColor - Background color for overlay.
 * @prop overlayPosition - What corner to align the overlay to.
 * @prop [style] - Applied to a wrapper View.
 */
export default class ComponentWithOverlay extends PureComponent<Props> {
  static defaultProps = {
    showOverlay: true,
  };

  render() {
    const {
      children,
      style,
      overlay,
      showOverlay,
      overlayPosition,
      overlaySize,
      overlayColor,
    } = this.props;

    const wrapperStyle = [styles.wrapper, style];
    const overlayStyle = [
      styles.wrapper,
      styles.overlay,
      styles[overlayPosition],
      {
        minWidth: overlaySize,
        height: overlaySize,
        borderRadius: overlaySize,
        backgroundColor: overlayColor,
      },
    ];

    return (
      <View style={wrapperStyle}>
        {children}
        {showOverlay && overlaySize > 0 && <View style={overlayStyle}>{overlay}</View>}
      </View>
    );
  }
}
