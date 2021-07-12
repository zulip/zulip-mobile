/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { SafeAreaView } from 'react-native-safe-area-context';

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
 *
 * Pads the horizontal insets with its background. (A parent component
 * could probably do this instead, if desired. The choice to do it here is
 * just in line with our other "row" components, like `SelectableOptionRow`,
 * which do need to pad the insets.)
 */
export default function SwitchRow(props: Props): Node {
  const { label, value, onValueChange, style, Icon } = props;

  const themeContext = useContext(ThemeContext);

  return (
    <SafeAreaView
      mode="padding"
      edges={['right', 'left']}
      style={[componentStyles.container, styles.listItem, style]}
    >
      {!!Icon && <Icon size={24} style={[styles.settingsIcon, { color: themeContext.color }]} />}
      <Label text={label} style={styles.flexed} />
      <View style={styles.rightItem}>
        <ZulipSwitch value={value} onValueChange={onValueChange} />
      </View>
    </SafeAreaView>
  );
}
