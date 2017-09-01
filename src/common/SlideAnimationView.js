/* @flow */
import React, { PureComponent } from 'react';
import { Animated } from 'react-native';

export default class SlideAnimationView extends PureComponent {
  state = {
    animationIndex: new Animated.Value(0),
  };

  animate() {
    const { easing, duration } = this.props;
    this.state.animationIndex.setValue(0);
    Animated.timing(this.state.animationIndex, {
      toValue: 1,
      duration,
      easing,
      useNativeDriver: true,
    }).start();
  }

  render() {
    this.animate();
    const { property, from, to, movement, style } = this.props;
    const animationValue = this.state.animationIndex.interpolate({
      inputRange: [0, 1],
      outputRange: movement === 'out' ? [from, to] : [to, from],
    });

    const slideStyle = { transform: [{ [property]: animationValue }] };
    return <Animated.View style={[style, slideStyle]}>{this.props.children}</Animated.View>;
  }
}
