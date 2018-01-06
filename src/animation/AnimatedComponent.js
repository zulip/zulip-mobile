/* @flow */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { Animated, Easing } from 'react-native';

import type { StyleObj } from '../types';

type Props = {
  children: ChildrenArray<*>,
  style?: StyleObj,
  visible: boolean,
  property: string,
  useNativeDriver: boolean,
};

export default class AnimatedComponent extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    visible: true,
    useNativeDriver: true,
  };

  animatedValue = new Animated.Value(0);

  componentWillReceiveProps(nextProps: Props) {
    Animated.timing(this.animatedValue, {
      toValue: nextProps.visible ? nextProps[nextProps.property] : 0,
      duration: 300,
      useNativeDriver: nextProps.useNativeDriver,
      easing: nextProps.visible ? Easing.elastic() : Easing.back(2),
    }).start();
  }

  render() {
    const { children, property, style } = this.props;
    const animatedStyle = {
      [property]: this.animatedValue,
    };

    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
  }
}
