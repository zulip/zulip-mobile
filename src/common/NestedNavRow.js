/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { LocalizableReactText } from '../types';
import Label from './Label';
import Touchable from './Touchable';
import { IconRight } from './Icons';
import type { SpecificIconType } from './Icons';
import styles, { ThemeContext } from '../styles';

type Props = $ReadOnly<{|
  Icon?: SpecificIconType,
  label: LocalizableReactText,

  // Use this to navigate to a "nested" screen.
  onPress: () => void,
|}>;

/**
 * A button that navigates to a "nested" screen.
 *
 * Shows a right-facing arrow to indicate its purpose. If you need a
 * selectable option row instead, use `SelectableOptionRow`.
 */
export default function NestedNavRow(props: Props): Node {
  const { label, onPress, Icon } = props;

  const themeContext = useContext(ThemeContext);

  return (
    <Touchable onPress={onPress}>
      <View style={styles.listItem}>
        {!!Icon && <Icon size={24} style={[styles.settingsIcon, { color: themeContext.color }]} />}
        <Label text={label} />
        <View style={styles.rightItem}>
          <IconRight size={24} style={[styles.settingsIcon, { color: themeContext.color }]} />
        </View>
      </View>
    </Touchable>
  );
}
