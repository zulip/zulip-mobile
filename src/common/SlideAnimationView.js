/* @flow */
import React, { PureComponent } from 'react';
import { Animated } from 'react-native';

import type { ChildrenArray, Style } from '../types';

type Props = {
  style: Style,
  children: ChildrenArray<*>,
  from: number,
  to: number,
  property: string,
  movement: 'in' | 'out',
  duration: number,
  easing?: (value: number) => number,
};

type State = {
  animationIndex: any, // { AnimatedValue } from 'react-native'
};

export default class SlideAnimationView extends PureComponent<Props, State> {
  state: State = {
    animationIndex: new Animated.Value(0),
  };

  static defaultProps = {
    duration: 300,
    movement: 'out',
  };

  animate() {
    const { easing, duration } = this.props;
    const { animationIndex } = this.state;
    animationIndex.setValue(0);
    Animated.timing(animationIndex, {
      toValue: 1,
      duration,
      easing,
      useNativeDriver: true,
    }).start();
  }

  render() {
    this.animate();
    const { children, property, from, to, movement, style } = this.props;
    const { animationIndex } = this.state;
    const animationValue = animationIndex.interpolate({
      inputRange: [0, 1],
      outputRange: movement === 'out' ? [from, to] : [to, from],
    });

    const slideStyle = { transform: [{ [property]: animationValue }] };
    return <Animated.View style={[style, slideStyle]}>{children}</Animated.View>;
  }
}
