import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { Touchable } from './';
import UserStatusIndicator from '../userlist/UserStatusIndicator';

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
  const imageStyle = {
    height: size,
    width: size,
    borderRadius: isCircular ? size / 2 : size / 8,
  };

  return (
    <Touchable onPress={onPress}>
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
