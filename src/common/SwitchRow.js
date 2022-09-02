/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { SpecificIconType } from './Icons';
import ZulipTextIntl from './ZulipTextIntl';
import ZulipSwitch from './ZulipSwitch';
import styles, { ThemeContext, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  Icon?: SpecificIconType,
  label: string,
  value: boolean,
  onValueChange: (newValue: boolean) => void,
|}>;

const componentStyles = createStyleSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,

    // For uniformity with other rows this might share a screen with, e.g.,
    // NestedNavRow and InputRowRadioButtons on the settings screen. See
    // height-related attributes on those rows.
    minHeight: 48,
  },
  icon: {
    textAlign: 'center',
    marginRight: 8,
  },
});

/**
 * A row with a label and a switch component.
 */
export default function SwitchRow(props: Props): Node {
  const { label, value, onValueChange, Icon } = props;

  const themeContext = useContext(ThemeContext);

  return (
    <View style={componentStyles.container}>
      {!!Icon && <Icon size={24} style={[componentStyles.icon, { color: themeContext.color }]} />}
      <ZulipTextIntl text={label} style={styles.flexed} />
      <View style={styles.rightItem}>
        <ZulipSwitch value={value} onValueChange={onValueChange} />
      </View>
    </View>
  );
}
