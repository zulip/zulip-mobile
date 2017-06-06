import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { Avatar } from '../common';
import NavButton from '../nav/NavButton';
import styles from '../styles';

const customStyles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 0,
  },
  text: {
    color: 'white',
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default ({ senderName, avatarUrl, realm, style, popRoute, children, handleAvatarPress }) => (
  <View style={[styles.navBar, style]}>
    <NavButton name="ios-arrow-back" onPress={popRoute} color="white" />
    <Avatar avatarUrl={avatarUrl} realm={realm} onPress={handleAvatarPress} />
    <Text style={[styles.username, customStyles.text]} numberOfLines={1}>
      {senderName}
    </Text>
    <View style={customStyles.buttons}>
      {children}
    </View>
  </View>
);
