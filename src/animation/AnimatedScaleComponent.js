/* @flow */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { Animated, Easing } from 'react-native';

import type { StyleObj } from '../types';

type Props = {
  children: ChildrenArray<*>,
  visible: boolean,
  style?: StyleObj,
};

export default class AnimatedScaleComponent extends PureComponent<Props> {
  props: Props;

  animatedValue = new Animated.Value(0);

  componentWillReceiveProps(nextProps: Props) {
    Animated.timing(this.animatedValue, {
      toValue: nextProps.visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.elastic(),
    }).start();
  }

  render() {
    const { children, visible, style } = this.props;
    const animatedStyle = {
      transform: [{ scale: this.animatedValue }],
      opacity: this.animatedValue,
      display: visible ? 'flex' : 'none',
    };

    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
  }
}
