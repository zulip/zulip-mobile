/* @flow */
import React from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

import messageLoadingImg from '../../static/img/message-loading.png';

const styles = StyleSheet.create({
  row: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    margin: 8,
  },
  semiCircle: {
    width: 32,
    height: 32,
    marginBottom: -28,
    alignSelf: 'center',
    borderColor: 'black',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRadius: 100,
  },
  logo: {
    width: 24,
    height: 24,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  line: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'black',
  },
});

export default class LoadingIndicator extends React.Component {
  props: {
    active: boolean,
    caughtUp?: boolean,
  };

  rotation: Animated;

  constructor() {
    super();
    this.rotation = new Animated.Value(0);
  }

  componentDidMount() {
    this.rotate();
  }

  rotate() {
    this.rotation.setValue(0);
    Animated.timing(this.rotation, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => this.rotate());
  }

  render() {
    const { active, caughtUp } = this.props;
    const rotation = this.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    const animation = { transform: [{ rotate: rotation }] };

    return (
      <View style={styles.row}>
        {caughtUp && <View style={styles.line} />}
        <View style={styles.loading}>
          {active && <Animated.View style={[styles.semiCircle, animation]} />}
          <Image style={[styles.logo]} source={messageLoadingImg} resizeMode="contain" />
        </View>
        {caughtUp && <View style={styles.line} />}
      </View>
    );
  }
}
