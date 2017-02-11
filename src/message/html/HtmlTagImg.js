import React from 'react';
import { Image, StyleSheet } from 'react-native';

import { getResource } from '../../utils/url';

const styles = StyleSheet.create({
  img: {
    width: 296,
    height: 150,
  },
});

export default ({ src, style, auth }) => (
  <Image
    source={getResource(src, auth)}
    resizeMode="contain"
    style={[styles.img, style]}
  />
);
