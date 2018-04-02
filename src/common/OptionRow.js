/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label, ZulipSwitch } from '../common';
import type { StyleObj } from '../types';

const styling = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
  Icon?: Object,
  label: string,
  defaultValue: boolean,
  style?: StyleObj,
  onValueChange: (newValue: boolean) => void,
};

export default class OptionRow extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  render() {
    const { label, defaultValue, onValueChange, style, Icon } = this.props;
    const { styles } = this.context;

    return (
      <View style={[styling.optionRow, style]}>
        {Icon && <Icon size={18} style={[styles.icon, styles.settingsIcon]} />}
        <Label style={styling.optionTitle} text={label} />
        <View style={styles.rightItem}>
          <ZulipSwitch defaultValue={defaultValue} onValueChange={onValueChange} />
        </View>
      </View>
    );
  }
}
