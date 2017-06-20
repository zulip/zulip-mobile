/* @flow */
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  frame: {
    paddingTop: 2,
    paddingRight: 4,
    paddingBottom: 2,
    paddingLeft: 4,
    borderRadius: 2,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
});

export default class UnreadCount extends Component {
  props: {
    count?: number,
  };

  render() {
    const { count } = this.props;

    if (!count) return null;

    return (
      <View style={styles.frame}>
        <Text style={styles.text}>
          {count < 100 ? count : '99+'}
        </Text>
      </View>
    );
  }
}
