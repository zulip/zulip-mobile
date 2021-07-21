/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { SpecificIconType } from './Icons';
import Label from './Label';
import ZulipSwitch from './ZulipSwitch';
import type { ThemeData } from '../styles';
import styles, { ThemeContext, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  Icon?: SpecificIconType,
  label: string,
  value: boolean,
  style?: ViewStyleProp,
  onValueChange: (newValue: boolean) => void,
|}>;

const componentStyles = createStyleSheet({
  container: {
    height: 56,
  },
});

/**
 * A row with a label and a switch component.
 */
export default class SwitchRow extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    const { label, value, onValueChange, style, Icon } = this.props;

    return (
      <View style={[componentStyles.container, styles.listItem, style]}>
        {!!Icon && <Icon size={24} style={[styles.settingsIcon, { color: this.context.color }]} />}
        <Label text={label} style={styles.flexed} />
        <View style={styles.rightItem}>
          <ZulipSwitch value={value} onValueChange={onValueChange} />
        </View>
      </View>
    );
  }
}
