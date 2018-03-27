/* @flow */
import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import MessageLoading from './MessageLoading';

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    justifyContent: 'space-around',
  },
});

export default () => (
  <ScrollView contentContainerStyle={styles.list}>
    <MessageLoading />
    <MessageLoading />
    <MessageLoading />
    <MessageLoading />
    <MessageLoading />
    <MessageLoading />
    <MessageLoading />
  </ScrollView>
);
