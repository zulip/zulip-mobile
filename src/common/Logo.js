/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Image } from 'react-native';

import logoImg from '../../static/img/logo.png';
import { createStyleSheet } from '../styles';

const styles = createStyleSheet({
  logo: {
    width: 40,
    height: 40,
    margin: 20,
    alignSelf: 'center',
  },
});

export default function Logo(): Node {
  return <Image style={styles.logo} source={logoImg} resizeMode="contain" />;
}
