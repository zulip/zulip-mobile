/* @flow */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { BORDER_COLOR } from '../styles';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderColor: BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 2,
  },
});

export default class Popup extends Component {
  render() {
    return (
      <View
        style={styles.container}
        maxHeight={250}
      >
        {this.props.children}
      </View>
    );
  }
}
