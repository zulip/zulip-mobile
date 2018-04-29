/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { Label, ZulipSwitch } from '../common';
import type { StyleObj } from '../types';

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
      <View style={[styles.listItem, style]}>
        {Icon && <Icon size={18} style={[styles.icon, styles.settingsIcon]} />}
        <Label text={label} />
        <View style={styles.rightItem}>
          <ZulipSwitch defaultValue={defaultValue} onValueChange={onValueChange} />
        </View>
      </View>
    );
  }
}
