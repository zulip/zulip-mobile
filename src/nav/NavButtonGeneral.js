/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { NAVBAR_SIZE, createStyleSheet } from '../styles';
import { Touchable } from '../common';

type Props = $ReadOnly<{|
  children: Node,
  onPress: () => void,
  accessibilityLabel?: string,
|}>;

const componentStyles = createStyleSheet({
  navButtonFrame: {
    width: NAVBAR_SIZE,
    height: NAVBAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function NavButtonGeneral(props: Props) {
  const { children, onPress, accessibilityLabel } = props;

  return (
    <Touchable onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <View style={componentStyles.navButtonFrame}>{children}</View>
    </Touchable>
  );
}
