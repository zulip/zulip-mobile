/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Animated, Easing } from 'react-native';

import type { Style } from '../types';

type Props = $ReadOnly<{|
  stylePropertyName: string,
  fullValue: number,
  children: Node,
  style?: Style,
  visible: boolean,
  useNativeDriver: boolean,
  delay: number,
|}>;

export default class AnimatedComponent extends PureComponent<Props> {
  static defaultProps = {
    visible: true,
    useNativeDriver: true,
    delay: 0,
  };

  animatedValue = new Animated.Value(0);

  animate() {
    Animated.timing(this.animatedValue, {
      toValue: this.props.visible ? this.props.fullValue : 0,
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
    const { children, stylePropertyName, style } = this.props;
    const animatedStyle = {
      [stylePropertyName]: this.animatedValue,
    };

    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
  }
}
