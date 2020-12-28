/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node as React$Node } from 'react';
import { Animated, Easing } from 'react-native';

import type { Style } from '../types';

type Props = $ReadOnly<{|
  children: React$Node,
  visible: boolean,
  style?: Style,
|}>;

type State = {|
  visible: boolean,
|};

export default class AnimatedScaleComponent extends PureComponent<Props, State> {
  state = {
    visible: this.props.visible,
  };

  animatedValue = new Animated.Value(this.props.visible ? 1 : 0);

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

  render() {
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
