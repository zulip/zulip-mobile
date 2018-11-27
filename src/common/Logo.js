/* @flow strict-local */
import React from 'react';
import { Image, StyleSheet } from 'react-native';

import logoImg from '../../static/img/logo.png';

const styles = StyleSheet.create({
  logo: {
    width: 40,
    height: 40,
    margin: 20,
    alignSelf: 'center',
  },
});

export default () => <Image style={styles.logo} source={logoImg} resizeMode="contain" />;
