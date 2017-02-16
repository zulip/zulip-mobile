import React from 'react';
import { StyleSheet, Image } from 'react-native';

import Touchable from '../common/Touchable';
import config from '../config';

const styles = StyleSheet.create({
  touchTarget: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
  },
});

const AppStoreLink = ({ handleClick }) => (
  <Touchable
    style={styles.touchTarget}
    onPress={() => handleClick(config.appStoreLink)}
  >
    <Image
      style={styles.logo}
      resizeMode="contain"
      source={require('../../static/img/app-store-download.png')}
    />
  </Touchable>
);

export default AppStoreLink;
