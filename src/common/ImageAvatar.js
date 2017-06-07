/* @flow */
import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { Touchable } from './';
import UserStatusIndicator from '../common/UserStatusIndicator';

const styles = StyleSheet.create({
  status: {
    marginLeft: 21,
    marginTop: 21,
  },
});

type Props = {
  avatarUrl: string,
  size: number,
  status?: string,
  isCircular?: boolean,
  onPress?: () => void
};


export default({
   avatarUrl,
   size,
   status,
   isCircular = false,
   onPress = () => {}
}: Props) => {
  const touchableStyle = {
    height: size,
    width: size,
  };

  const imageStyle = {
    ...touchableStyle,
    borderRadius: isCircular ? size / 2 : size / 8
  };

  return (
    <Touchable onPress={onPress} style={touchableStyle}>
      <Image
        style={imageStyle}
        source={{ uri: avatarUrl }}
        resizeMode="contain"
      >
        {status &&
          <UserStatusIndicator
            style={styles.status}
            status={status}
          />
        }
      </Image>
    </Touchable>
  );
};
