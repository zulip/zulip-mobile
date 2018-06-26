/* @flow */
/* eslint-disable react-native/no-unused-styles */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ChildrenArray, Style } from '../types';
import { BRAND_COLOR } from '../styles';
import { Touchable } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    // flex: 1,
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

type Props = {
  children: ChildrenArray<*>,
  overlay: any,
  showOverlay: boolean,
  overlaySize: number,
  overlayColor: string,
  overlayPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
  style?: Style,
  onPress?: () => void,
};

/**
 * Layout component that streamlines how we
 * overlay a component over another component
 *
 * @prop children - Main component to be rendered.
 * @prop overlay - Component to be overlayed over the main one.
 * @prop [showOverlay] - Should the overlay be shown.
 * @prop [overlaySize] - The size of the overlay in pixels,
 * @prop [overlayColor] - The color of the overlay.
 * @prop [overlayPosition] - Overlay position can be one of the following:
 *  * 'top-right'
 *  * 'top-left'
 *  * 'bottom-right'
 *  * 'bottom-left'
 * @prop [style] - Style object applied to the main component.
 * @prop [onPress] - Event called on pressing the main component.
 */
export default class ComponentWithOverlay extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    showOverlay: true,
    overlaySize: 0,
    overlayColor: BRAND_COLOR,
    overlayPosition: 'top-right',
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
      onPress,
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
      <Touchable onPress={onPress}>
        <View style={wrapperStyle}>
          {children}
          {showOverlay && overlaySize > 0 && <View style={overlayStyle}>{overlay}</View>}
        </View>
      </Touchable>
    );
  }
}
