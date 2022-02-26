/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import { BRAND_COLOR, createStyleSheet } from '../styles';
import { Icon } from '../common/Icons';
import type { IconNames } from '../common/Icons';
import Touchable from '../common/Touchable';

const componentStyles = createStyleSheet({
  buttonFrame: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    textAlign: 'center',
  },
});

/**
 * A button for use in a (top) app bar.
 *
 * This is meant to be used in a Material top app bar:
 *   https://material.io/components/app-bars-top
 * with touch targets conforming to the spec here:
 *   https://material.io/design/usability/accessibility.html#layout-and-typography
 * That is, the touch targets are 48x48, and immediately abut each other.
 *
 * This component is 48x48, all of it the touch target, with a 24x24 icon.
 * That means no padding is needed between these, but some padding may be
 * needed between these and the edge of the app bar; for details, see:
 *   https://material.io/components/app-bars-top#specs
 */
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
