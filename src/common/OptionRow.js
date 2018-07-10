/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context, Style } from '../types';
import { Label, ZulipSwitch } from '../common';

type Props = {
  Icon?: Object,
  label: string,
  defaultValue: boolean,
  style?: Style,
  onValueChange: (newValue: boolean) => void,
};

export default class OptionRow extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { label, defaultValue, onValueChange, style, Icon } = this.props;
    const { styles } = this.context;

    return (
      <View style={[styles.listItem, style]}>
        {Icon && <Icon size={18} style={[styles.icon, styles.settingsIcon]} />}
        <Label text={label} style={styles.flexed} />
        <View style={styles.rightItem}>
          <ZulipSwitch defaultValue={defaultValue} onValueChange={onValueChange} />
        </View>
      </View>
    );
  }
}
