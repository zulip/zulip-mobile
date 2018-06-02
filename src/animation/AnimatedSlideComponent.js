/* @flow */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { Animated } from 'react-native';

import type { Style } from '../types';

type Props = {
  children: ChildrenArray<*>,
  property: string,
  visible: boolean,
  style?: Style,
};

type State = {
  visible: boolean,
};

export default class AnimatedSlideComponent extends PureComponent<Props, State> {
  props: Props;
  state: State;

  animatedValue = new Animated.Value(this.props.visible ? 0 : 100);

  componentWillReceiveProps(nextProps: Props) {
    Animated.timing(this.animatedValue, {
      toValue: nextProps.visible ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  render() {
    const { children, property, style } = this.props;
    const animatedStyle = {
      transform: [{ [property]: this.animatedValue }],
    };

    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
  }
}
