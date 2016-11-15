import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { BORDER_COLOR } from '../common/styles';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'white',
    borderColor: BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 2,
  },
});

export default class Popup extends Component {
  render() {
    return (
      <View style={styles.container}>
        {this.props.children}
      </View>
    );
  }
}
