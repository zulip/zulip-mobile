import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { UserStatus } from '../api';

const styles = StyleSheet.create({
  common: {
    width: 12,
    height: 12,
    borderRadius: 100,
  },
  active: {
    backgroundColor: '#44c21d',
  },
  idle: {
    backgroundColor: 'rgba(255, 165, 0, 0.25)',
    borderColor: 'rgba(255, 165, 0, 1)',
    borderWidth: 1,
  },
  offline: {
    backgroundColor: 'transparent',
    borderColor: 'lightgray',
    borderWidth: 1,
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

    if (!status) return null;

    return (
      <View style={[styles.common, styles[status]]} />
    );
  }
}
