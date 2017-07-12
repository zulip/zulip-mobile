/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import MessageLoading from '../message/MessageLoading';

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    justifyContent: 'space-around',
  },
});

export default () =>
  <View style={styles.list}>
    <MessageLoading />
    <MessageLoading />
    <MessageLoading />
    <MessageLoading />
    <MessageLoading />
    <MessageLoading />
  </View>;
