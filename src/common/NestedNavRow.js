/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Label from './Label';
import Touchable from './Touchable';
import { IconRight } from './Icons';
import type { SpecificIconType } from './Icons';
import styles, { ThemeContext } from '../styles';

type Props = $ReadOnly<{|
  Icon?: SpecificIconType,
  label: string,

  // Use this to navigate to a "nested" screen.
  onPress: () => void,
|}>;

/**
 * A button that navigates to a "nested" screen.
 *
 * Shows a right-facing arrow to indicate its purpose. If you need a
 * selectable option row instead, use `SelectableOptionRow`.
 *
 * Pads the horizontal insets with its background.
 */
export default function NestedNavRow(props: Props): Node {
  const { label, onPress, Icon } = props;

  const themeContext = useContext(ThemeContext);

  return (
    <Touchable onPress={onPress}>
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.listItem}>
        {!!Icon && <Icon size={24} style={[styles.settingsIcon, { color: themeContext.color }]} />}
        <Label text={label} />
        <View style={styles.rightItem}>
          <IconRight size={24} style={[styles.settingsIcon, { color: themeContext.color }]} />
        </View>
      </SafeAreaView>
    </Touchable>
  );
}
