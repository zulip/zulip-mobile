/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  containerPortrait: {
    flex: 1,
    flexDirection: 'column',
  },
  infoContainer: {
    padding: 8,
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
  <View style={styles.containerPortrait} onLayout={handleOrientationChange}>
    {avatar(screenWidth)}
    <View style={styles.infoContainer}>
      {userDetails()}
      {sendButton()}
    </View>
  </View>;
