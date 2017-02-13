import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { Touchable } from './';
import UserStatusIndicator from '../common/UserStatusIndicator';

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  status: {
    marginLeft: 21,
    marginTop: 21,
  },
});

export default({ avatarUrl, size, status, isCircular, onPress }) => {
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
            status={status}
            customStyles={styles.status}
          />
        }
      </Image>
    </Touchable>
  );
};
