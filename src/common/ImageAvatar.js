import React from 'react';
import {
  Image,
} from 'react-native';

import { Touchable } from './';

export default({ avatarUrl, size, isCircular, onPress }) => {
  const style = {
    height: size,
    width: size,
    borderRadius: isCircular ? size / 2 : size / 8,
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
