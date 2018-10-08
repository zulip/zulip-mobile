/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { Animated, Easing } from 'react-native';

import type { Style } from '../types';

type Props = {|
  children: ChildrenArray<*>,
  visible: boolean,
  style?: Style,
|};

export default class AnimatedScaleComponent extends PureComponent<Props> {
  animatedValue = new Animated.Value(this.props.visible ? 1 : 0);

  componentWillReceiveProps(nextProps: Props) {
    Animated.timing(this.animatedValue, {
      toValue: nextProps.visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.elastic(),
    }).start();
  }

  render() {
    const { children, style } = this.props;
    const animatedStyle = {
      transform: [{ scale: this.animatedValue }],
      opacity: this.animatedValue,
    };

    return (
      <Animated.View style={[animatedStyle, style]}>
        {this.props.visible ? children : null}
      </Animated.View>
    );
  }
}
