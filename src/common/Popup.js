/* @flow */
import React, { Component } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

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
      <ScrollView
        style={styles.container}
        maxHeight={300}
      >
        {this.props.children}
      </ScrollView>
    );
  }
}
