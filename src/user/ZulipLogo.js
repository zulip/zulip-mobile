import React from 'react';
import {
  Image,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});

export default () => (
  <Image
    style={styles.logo}
    source={require('../../static/img/zulip-logo.png')} resizeMode="contain"
  />
);
