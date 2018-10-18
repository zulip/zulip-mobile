/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import format from 'date-fns/format';
import type { ErrorLog } from '../types';

import { RawLabel } from '../common';
import { numberWithSeparators } from '../utils/misc';

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(127, 127, 127, 0.25)',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    opacity: 0.9,
  },
});

export default class ErrorLogItem extends PureComponent<ErrorLog> {
  props: ErrorLog;

  render() {
    const { timestamp, error, message, isHandled } = this.props;

    return (
      <View style={styles.item}>
        <RawLabel style={styles.label} text={format(timestamp, 'HH:mm:ss.S')} />
        <RawLabel style={styles.label} text={error} />
        <RawLabel style={styles.value} text={message} />
      </View>
    );
  }
}
