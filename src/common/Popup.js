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
    const border = (this.props.noBorder) ? { borderWidth: 0 } : undefined;
    return (
      <View
        style={[styles.container, border]}
        maxHeight={250}
      >
        {this.props.children}
      </View>
    );
  }
}
