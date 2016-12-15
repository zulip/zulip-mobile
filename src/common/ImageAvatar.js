import React from 'react';
import {
  Image,
} from 'react-native';

import { Touchable } from './';

export default({ avatarUrl, size, onPress }) => {
  const style = {
    height: size,
    width: size,
    borderRadius: size / 2,
  };

  return (
    <Touchable onPress={onPress}>
      <Image
        style={style}
        source={{ uri: avatarUrl }}
        resizeMode="contain"
      />
    </Touchable>
  );
};
