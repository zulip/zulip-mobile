/* @flow */
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { ZulipStatusBar } from '../common';
import LightBoxContainer from './LightBoxContainer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

export default class LightBoxScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ZulipStatusBar backgroundColor="black" />
        <LightBoxContainer {...this.props} />
      </View>
    );
  }
}
