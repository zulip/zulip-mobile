/* @flow */
import React from 'react';
import { StyleSheet, Text, ActivityIndicator, View } from 'react-native';

import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  row: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  text: {
    color: BRAND_COLOR,
    paddingLeft: 8,
  },
});

export default class TimeRow extends React.PureComponent {
  render() {
    return (
      <View style={styles.row}>
        <ActivityIndicator size="small" color={BRAND_COLOR} style={styles.fetching} />
        <Text style={styles.text}>LOADING...</Text>
      </View>
    );
  }
}
