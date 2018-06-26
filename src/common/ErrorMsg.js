/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { CONTROL_SIZE } from '../styles';
import { Label } from '../common';

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    height: CONTROL_SIZE / 2,
    marginTop: 5,
    marginBottom: 5,
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

/**
 * Displays a styled error message.
 * If no message provided, component is not rendered.
 *
 * @prop error - The error message string.
 */
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
