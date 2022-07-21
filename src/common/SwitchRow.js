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
    height: 56,
  },
});

/**
 * A row with a label and a switch component.
 */
export default function SwitchRow(props: Props): Node {
  const { label, value, onValueChange, Icon } = props;

  const themeContext = useContext(ThemeContext);

  return (
    <View style={[componentStyles.container, styles.listItem]}>
      {!!Icon && <Icon size={24} style={[styles.settingsIcon, { color: themeContext.color }]} />}
      <ZulipTextIntl text={label} style={styles.flexed} />
      <View style={styles.rightItem}>
        <ZulipSwitch value={value} onValueChange={onValueChange} />
      </View>
    </View>
  );
}
