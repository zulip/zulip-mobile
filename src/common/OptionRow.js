/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context, Style } from '../types';
import Label from './Label';
import ZulipSwitch from './ZulipSwitch';
import styles from '../styles';

type Props = {|
  Icon?: Object,
  label: string,
  defaultValue: boolean,
  style?: Style,
  onValueChange: (newValue: boolean) => void,
|};

export default class OptionRow extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { label, defaultValue, onValueChange, style, Icon } = this.props;
    const { styles: contextStyles } = this.context;

    return (
      <View style={[styles.listItem, style]}>
        {Icon && <Icon size={18} style={[contextStyles.icon, styles.settingsIcon]} />}
        <Label text={label} style={styles.flexed} />
        <View style={styles.rightItem}>
          <ZulipSwitch defaultValue={defaultValue} onValueChange={onValueChange} />
        </View>
      </View>
    );
  }
}
