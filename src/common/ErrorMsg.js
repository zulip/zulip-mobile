/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { CONTROL_SIZE } from '../styles';
import { Label } from '../common';

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    height: CONTROL_SIZE / 2,
    marginVertical: 8,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

type Props = {
  error: string,
};

export default class ErrorMsg extends PureComponent<Props> {
  props: Props;

  render() {
    const { error } = this.props;

    if (!error) {
      return null;
    }

    return (
      <View style={styles.field}>
        <Label style={styles.error} text={error} />
      </View>
    );
  }
}
