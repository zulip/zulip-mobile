/* @flow */
import React, { PureComponent } from 'react';
import { Animated, Easing } from 'react-native';

type Props = {
  children: [],
  visible: boolean,
  height: number,
};

export default class AnimatedHeightComponent extends PureComponent {
  props: Props;

  animatedValue = new Animated.Value(0);

  componentWillReceiveProps(nextProps: Props) {
    Animated.timing(this.animatedValue, {
      toValue: nextProps.visible ? nextProps.height : 0,
      duration: 300,
      easing: Easing.elastic(),
    }).start();
  }

  render() {
    const { children } = this.props;
    const animatedStyle = {
      height: this.animatedValue,
    };

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
  }
}
