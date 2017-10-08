/* @flow */
/* eslint-disable react-native/no-unused-styles */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';
import { BRAND_COLOR } from '../styles';
import { Touchable } from '../common';

const styles = StyleSheet.create({
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

export default class ComponentWithOverlay extends PureComponent {
  props: {
    children: any[],
    overlay: any,
    showOverlay?: boolean,
    overlaySize?: number,
    overlayColor?: string,
    overlayPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
    style?: StyleObj,
    onPress: () => void,
  };

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
        width: overlaySize,
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
