/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Style } from '../types';
import type { Icon as IconType } from './Icons';
import Label from './Label';
import ZulipSwitch from './ZulipSwitch';
import type { ThemeColors } from '../styles';
import styles, { ThemeContext } from '../styles';

type Props = {|
  Icon?: IconType,
  label: string,
  defaultValue: boolean,
  style?: Style,
  onValueChange: (newValue: boolean) => void,
|};

export default class OptionRow extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeColors;

  styles = {
    icon: {
      ...styles.settingsIcon,
      color: this.context.color,
    },
  };

  render() {
    const { label, defaultValue, onValueChange, style, Icon } = this.props;

    return (
      <View style={[styles.listItem, style]}>
        {Icon && <Icon size={18} style={this.styles.icon} />}
        <Label text={label} style={styles.flexed} />
        <View style={styles.rightItem}>
          <ZulipSwitch defaultValue={defaultValue} onValueChange={onValueChange} />
        </View>
      </View>
    );
  }
}
