import React from 'react';
import {
  Image,
} from 'react-native';

export default({ avatarUrl, size }) => {
  const style = {
    height: size,
    width: size,
    borderRadius: size / 2,
  };

  return (
    <Image
      style={style}
      source={{ uri: avatarUrl }}
      resizeMode="contain"
    />
  );
};
