/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CONTROL_SIZE } from '../styles';
import { Label } from '../common';

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    height: CONTROL_SIZE,
    marginTop: 5,
    marginBottom: 5,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default class ErrorMsg extends React.PureComponent {
  props: {
    error: string,
  };

  render() {
    const { error } = this.props;

    if (!error) return null;

    return (
      <View style={styles.field}>
        <Label style={styles.error} text={error} />
      </View>
    );
  }
}
