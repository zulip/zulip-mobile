import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { getResource } from '../../utils/url';

const styles = StyleSheet.create({
  img: {
    width: 296,
    height: 150,
  },
  emoji: {
    width: 24,
    height: 24,
  },
});

export default ({ src, className, auth }) => (
  <Image
    source={getResource(src, auth)}
    resizeMode={className === 'emoji' ? 'cover' : 'contain'}
    style={className === 'emoji' ? styles.emoji : styles.img}
  />
);
