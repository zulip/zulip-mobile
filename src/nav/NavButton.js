/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import { BRAND_COLOR, createStyleSheet, NAVBAR_SIZE } from '../styles';
import { Icon } from '../common/Icons';
import type { IconNames } from '../common/Icons';
import { Touchable } from '../common';

const componentStyles = createStyleSheet({
  buttonFrame: {
    width: NAVBAR_SIZE,
    height: NAVBAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    textAlign: 'center',
  },
});

/** For use in an app bar. */
export default function NavButton(
  props: $ReadOnly<{|
    color?: string,
    name: IconNames,
    onPress: () => void,
    accessibilityLabel?: string,
  |}>,
): Node {
  const { name, color = BRAND_COLOR, onPress, accessibilityLabel } = props;

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={componentStyles.buttonFrame}
    >
      <Icon size={24} style={componentStyles.buttonIcon} color={color} name={name} />
    </Touchable>
  );
}
