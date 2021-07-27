/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Animated, Easing } from 'react-native';
import type AnimatedValue from 'react-native/Libraries/Animated/src/nodes/AnimatedValue';

import type { Style } from '../types';

type Props = $ReadOnly<{|
  children: Node,
  visible: boolean,
  style?: Style,
|}>;

type State = {|
  visible: boolean,
|};

export default class AnimatedScaleComponent extends PureComponent<Props, State> {
  state: State = {
    visible: this.props.visible,
  };

  animatedValue: AnimatedValue = new Animated.Value(this.props.visible ? 1 : 0);

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.visible) {
      this.setState({ visible: true });
    }
    Animated.timing(this.animatedValue, {
      toValue: nextProps.visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.elastic(),
    }).start(() => this.setState({ visible: nextProps.visible }));
  }

  render(): Node {
    const { children, style } = this.props;
    const { visible } = this.state;
    const animatedStyle = {
      transform: [{ scale: this.animatedValue }],
      opacity: this.animatedValue,
      display: visible ? 'flex' : 'none',
    };

    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
  }
}
