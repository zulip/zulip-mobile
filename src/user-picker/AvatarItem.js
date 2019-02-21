/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { UserAvatarWithPresence, ComponentWithOverlay, RawLabel } from '../common';
import { IconCancel } from '../common/Icons';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    marginLeft: 8,
    marginVertical: 8,
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

type Props = {|
  email: string,
  avatarUrl: ?string,
  fullName: string,
  onPress: (email: string) => void,
|};

export default class AvatarItem extends PureComponent<Props> {
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
    const { email, avatarUrl, fullName } = this.props;
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
          onPress={this.handlePress}
        >
          <UserAvatarWithPresence
            key={email}
            size={50}
            avatarUrl={avatarUrl}
            email={email}
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
