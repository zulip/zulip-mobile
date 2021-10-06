/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { BRAND_COLOR, createStyleSheet, NAVBAR_SIZE } from '../styles';
import { Icon } from '../common/Icons';
import type { IconNames } from '../common/Icons';
import { Touchable } from '../common';

const componentStyles = createStyleSheet({
  navButtonFrame: {
    width: NAVBAR_SIZE,
    height: NAVBAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonIcon: {
    textAlign: 'center',
  },
});

export function NavButtonGeneral(
  props: $ReadOnly<{|
    children: Node,
    onPress: () => void,
    accessibilityLabel?: string,
  |}>,
): Node {
  const { children, onPress, accessibilityLabel } = props;

  return (
    <Touchable onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <View style={componentStyles.navButtonFrame}>{children}</View>
    </Touchable>
  );
}

export default function NavButton(
  props: $ReadOnly<{|
    color?: string,
    style?: TextStyleProp,
    name: IconNames,
    onPress: () => void,
    accessibilityLabel?: string,
  |}>,
): Node {
  const { name, style, color = BRAND_COLOR, onPress, accessibilityLabel } = props;

  return (
    <NavButtonGeneral onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <Icon size={24} style={[componentStyles.navButtonIcon, style]} color={color} name={name} />
    </NavButtonGeneral>
  );
}
