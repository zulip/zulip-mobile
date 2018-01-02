/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IconStar } from '../common/Icons';

const styles = StyleSheet.create({
  iconWrapper: {
    marginTop: 4,
    flex: 0.1,
  },
  iconStar: {
    fontSize: 20,
    color: '#447C22',
    alignSelf: 'flex-end',
  },
});

export default () => (
  <View style={styles.iconWrapper}>
    <IconStar style={styles.iconStar} />
  </View>
);
