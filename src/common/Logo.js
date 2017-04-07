import React from 'react';
import {Image, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  logo: {
    width: 40,
    height: 40,
    margin: 20,
    alignSelf: 'center',
  },
});

export default () => (
  <Image
    style={styles.logo}
    source={require('../../static/img/logo.png')}
    resizeMode="contain"
  />
);
