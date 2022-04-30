/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Animated, Easing } from 'react-native';
import type AnimatedValue from 'react-native/Libraries/Animated/nodes/AnimatedValue';

import type { Style } from '../types';

type Props = $ReadOnly<{|
  style?: Style,
  children: Node,
|}>;

export default class AnimatedRotateComponent extends PureComponent<Props> {
  rotation: AnimatedValue = new Animated.Value(0);

  componentDidMount() {
    this.rotation.setValue(0);
    Animated.loop(
      Animated.timing(this.rotation, {
        toValue: 360,
        duration: 1000,

        // $FlowFixMe[method-unbinding] - RN should fix, and this code isn't central.
        easing: Easing.linear,

        useNativeDriver: true,
      }),
    ).start();
  }

  render(): Node {
    const { children, style } = this.props;
    const rotation = this.rotation.interpolate({
      inputRange: [0, 360],
      outputRange: (['0deg', '360deg']: $ReadOnlyArray<string>),
    });
    const animatedStyle = { transform: [{ rotate: rotation }] };

    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
  }
}
