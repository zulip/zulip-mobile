/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { Animated, Easing, View } from 'react-native';
import type AnimatedValue from 'react-native/Libraries/Animated/nodes/AnimatedValue';

import type { UserId, UserOrBot } from '../types';
import UserAvatarWithPresence from '../common/UserAvatarWithPresence';
import ComponentWithOverlay from '../common/ComponentWithOverlay';
import ZulipText from '../common/ZulipText';
import Touchable from '../common/Touchable';
import { createStyleSheet } from '../styles';
import { IconCancel } from '../common/Icons';

const styles = createStyleSheet({
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

type Props = $ReadOnly<{|
  user: UserOrBot,
  onPress: UserId => void,
|}>;

/**
 * Pressable avatar for items in the user-picker card.
 */
export default class AvatarItem extends PureComponent<Props> {
  animatedValue: AnimatedValue = new Animated.Value(0);

  componentDidMount() {
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.elastic(),
    }).start();
  }

  handlePress: () => void = () => {
    const { user, onPress } = this.props;
    Animated.timing(this.animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.elastic(),
    }).start(() => onPress(user.user_id));
  };

  render(): Node {
    const { user } = this.props;
    const animatedStyle = {
      transform: [{ scale: this.animatedValue }],
    };
    const firstName = user.full_name.trim().split(' ')[0];

    return (
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <Touchable onPress={this.handlePress}>
          <ComponentWithOverlay
            overlaySize={20}
            overlayColor="white"
            overlayPosition="bottom-right"
            overlay={<IconCancel color="gray" size={20} />}
          >
            <UserAvatarWithPresence
              key={user.user_id}
              size={50}
              avatarUrl={user.avatar_url}
              email={user.email}
            />
          </ComponentWithOverlay>
        </Touchable>
        <View style={styles.textFrame}>
          <ZulipText style={styles.text} text={firstName} numberOfLines={1} />
        </View>
      </Animated.View>
    );
  }
}
