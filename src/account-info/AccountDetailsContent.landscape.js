/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  containerLandscape: {
    flex: 1,
    flexDirection: 'row',
  },
  avatarContainerLandscape: {
    flex: 0.5,
  },
  infoContainerLandscape: {
    flex: 0.5,
  },
});

type Props = {
  screenWidth: number,
  avatar: (width: number) => any,
  userDetails: () => any,
  sendButton: () => any,
  handleOrientationChange: (event: Object) => void,
};

export default ({ screenWidth, handleOrientationChange, avatar, userDetails, sendButton }: Props) =>
  <View style={styles.containerLandscape} onLayout={handleOrientationChange}>
    <View style={styles.avatarContainerLandscape}>
      {avatar(screenWidth / 2)}
    </View>
    <View style={styles.infoContainerLandscape}>
      {userDetails()}
      {sendButton()}
    </View>
  </View>;
