import React from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  loading: {
    width: 30,
    height: 30,
    margin: 10,
    alignSelf: 'center',
    overflow: 'hidden',
  },
});

export default class Loading extends React.Component {
  constructor() {
    super();
    this.state = {
      rotation: new Animated.Value(0),
    };
  }

  componentDidMount() {
    this.rotate();
  }

  rotate() {
    this.state.rotation.setValue(0);
    Animated.timing(
      this.state.rotation,
      {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
      }
    ).start(() => this.rotate());
  }

  render() {
    const rotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    return (
      <Animated.Image
        style={[
          styles.loading,
          this.props.active ? { transform: [{ rotate: rotation }] } : {},
        ]}
        source={require('../../static/img/message-loading.png')}
        resizeMode="contain"
      />
    );
  }
}
