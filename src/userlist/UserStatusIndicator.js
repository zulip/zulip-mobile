import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { UserStatus } from '../api';

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
    backgroundColor: 'rgba(255, 165, 0, 0.25)',
    borderColor: 'rgba(255, 165, 0, 1)',
    borderWidth: 2,
  },
  offline: {
    backgroundColor: 'transparent',
    borderColor: 'grey',
    borderWidth: 2,
  },
  unknown: {

  },
});


export default class UserStatusIndicator extends Component {

  props: {
    status: UserStatus,
  }

  static defaultProps = {
    status: 'unknown',
  };

  render() {
    const { status } = this.props;

    return (
      <View style={[styles.common, styles[status]]} />
    );
  }
}
