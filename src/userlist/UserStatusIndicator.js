import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  common: {
    width: 16,
    height: 16,
    borderRadius: 100,
    margin: 14,
  },
  active: {
    borderColor: 'pink',
    backgroundColor: 'green',
  },
  idle: {
    backgroundColor: 'orange',
  },
  offline: {
    backgroundColor: 'grey',
  },
});


export default class UserStatusIndicator extends Component {

  props: {
    status: 'active' | 'idle',
  }

  render() {
    const { status } = this.props;

    return (
      <View style={[styles.common, styles[status]]} />
    );
  }
}
