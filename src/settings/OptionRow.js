/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label, ZulipSwitch } from '../common';

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
  },
});

export default class OptionRow extends PureComponent {
  props: {
    label: string,
    defaultValue: boolean,
    onValueChange: () => void,
  };

  render() {
    const { label, defaultValue, onValueChange } = this.props;

    return (
      <View style={styles.optionRow}>
        <Label text={label} />
        <ZulipSwitch defaultValue={defaultValue} onValueChange={onValueChange} />
      </View>
    );
  }
}
