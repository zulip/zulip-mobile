/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type Props = {
  Icon: Object,
  color: string,
};

export default ({ Icon, color }: Props) => (
  <View style={styles.wrapper}>
    <Icon size={24} color={color} />
  </View>
);
