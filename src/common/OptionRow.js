/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label, ZulipSwitch } from '../common';
import type { StyleObj } from '../types';

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
  },
  optionTitle: {
    padding: 8,
    paddingLeft: 0,
  },
});

type Props = {
  label: string,
  defaultValue: boolean,
  style?: StyleObj,
  onValueChange: (newValue: boolean) => void,
};

export default class OptionRow extends PureComponent<Props> {
  props: Props;

  render() {
    const { label, defaultValue, onValueChange, style } = this.props;

    return (
      <View style={[styles.optionRow, style]}>
        <Label style={styles.optionTitle} text={label} />
        <ZulipSwitch defaultValue={defaultValue} onValueChange={onValueChange} />
      </View>
    );
  }
}
