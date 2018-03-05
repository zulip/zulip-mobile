/* @flow */
import React from 'react';
import { Image, StyleSheet } from 'react-native';

import unreadMsgImg from '../../static/img/unread-msg.png';

const styles = StyleSheet.create({
  unreadMsg: {
    width: 140,
    height: 140,
    margin: 20,
    alignSelf: 'center',
  },
});

export default () => <Image style={styles.unreadMsg} source={unreadMsgImg} resizeMode="contain" />;
