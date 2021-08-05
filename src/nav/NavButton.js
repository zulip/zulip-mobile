/* @flow strict-local */
import React from 'react';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import { Icon } from '../common/Icons';
import type { IconNames } from '../common/Icons';
import NavButtonGeneral from './NavButtonGeneral';

type Props = $ReadOnly<{|
  color?: string,
  style?: TextStyleProp,
  name: IconNames,
  onPress: () => void,
  accessibilityLabel?: string,
|}>;

const componentStyles = createStyleSheet({
  navButtonIcon: {
    textAlign: 'center',
  },
});

export default function NavButton(props: Props) {
  const { name, style, color = BRAND_COLOR, onPress, accessibilityLabel } = props;

  return (
    <NavButtonGeneral onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <Icon size={24} style={[componentStyles.navButtonIcon, style]} color={color} name={name} />
    </NavButtonGeneral>
  );
}
