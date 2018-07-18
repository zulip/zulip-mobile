/* @flow */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { Animated, Easing } from 'react-native';

import type { Style } from '../types';

type Props = {
  children: ChildrenArray<*>,
  style?: Style,
  visible: boolean,
  property: string,
  useNativeDriver: boolean,
  delay: number,
};

export default class AnimatedComponent extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    visible: true,
    useNativeDriver: true,
    delay: 0,
  };

  animatedValue = new Animated.Value(0);

  animate() {
    Animated.timing(this.animatedValue, {
      toValue: this.props.visible ? this.props[this.props.property] : 0,
      delay: this.props.delay,
      duration: 300,
      useNativeDriver: this.props.useNativeDriver,
      easing: Easing.out(Easing.poly(4)),
    }).start();
  }

  componentDidMount() {
    this.animate();
  }

  componentDidUpdate() {
    this.animate();
  }

  render() {
    const { children, property, style } = this.props;
    const animatedStyle = {
      [property]: this.animatedValue,
    };

    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
  }
}
