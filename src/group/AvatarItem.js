/* @flow */
import React, { PureComponent } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import type { UserStatus } from '../types';
import { Avatar, ComponentWithOverlay, RawLabel } from '../common';
import { IconCancel } from '../common/Icons';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    marginLeft: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  text: {
    flex: 1,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  textFrame: {
    height: 20,
    width: 50,
    flexDirection: 'row',
  },
});

type Props = {
  email: string,
  avatarUrl: string,
  fullName: string,
  status: UserStatus,
  onPress: (email: string) => void,
};

export default class AvatarItem extends PureComponent<Props> {
  props: Props;

  animatedValue = new Animated.Value(0);

  componentDidMount() {
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.elastic(),
    }).start();
  }

  handlePress = () => {
    const { email, onPress } = this.props;
    Animated.timing(this.animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.elastic(),
    }).start(() => onPress(email));
  };

  render() {
    const { email, avatarUrl, fullName, status } = this.props;
    const animatedStyle = {
      transform: [{ scale: this.animatedValue }],
    };
    const firstName = fullName.trim().split(' ')[0];

    return (
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <ComponentWithOverlay
          overlaySize={20}
          overlayColor="white"
          overlayPosition="bottom-right"
          overlay={<IconCancel color="gray" size={20} />}
          onPress={this.handlePress}>
          <Avatar
            key={email}
            size={50}
            avatarUrl={avatarUrl}
            email={email}
            name={fullName}
            status={status}
            onPress={this.handlePress}
          />
        </ComponentWithOverlay>
        <View style={styles.textFrame}>
          <RawLabel style={styles.text} text={firstName} numberOfLines={1} />
        </View>
      </Animated.View>
    );
  }
}
