/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { SpecificIconType } from './Icons';
import Label from './Label';
import ZulipSwitch from './ZulipSwitch';
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
export default function SwitchRow(props: Props): Node {
  const { label, value, onValueChange, style, Icon } = props;

  const themeContext = useContext(ThemeContext);

  return (
    <View style={[componentStyles.container, styles.listItem, style]}>
      {!!Icon && <Icon size={24} style={[styles.settingsIcon, { color: themeContext.color }]} />}
      <Label text={label} style={styles.flexed} />
      <View style={styles.rightItem}>
        <ZulipSwitch value={value} onValueChange={onValueChange} />
      </View>
    </View>
  );
}
