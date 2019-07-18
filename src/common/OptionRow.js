/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { IconType } from './Icons';
import Label from './Label';
import ZulipSwitch from './ZulipSwitch';
import type { ThemeColors } from '../styles';
import styles, { ThemeContext } from '../styles';

type Props = {|
  Icon?: IconType,
  label: string,
  value: boolean,
  style?: ViewStyleProp,
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
    const { label, value, onValueChange, style, Icon } = this.props;

    return (
      <View style={[styles.listItem, style]}>
        {!!Icon && <Icon size={18} style={this.styles.icon} />}
        <Label text={label} style={styles.flexed} />
        <View style={styles.rightItem}>
          <ZulipSwitch value={value} onValueChange={onValueChange} />
        </View>
      </View>
    );
  }
}
