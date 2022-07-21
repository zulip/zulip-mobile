/* @flow strict-local */
import React, { useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { LocalizableReactText } from '../types';
import ZulipTextIntl from './ZulipTextIntl';
import Touchable from './Touchable';
import { IconRight } from './Icons';
import type { SpecificIconType } from './Icons';
import globalStyles, { ThemeContext, createStyleSheet } from '../styles';

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

  const styles = useMemo(
    () =>
      createStyleSheet({
        container: {
          // Minimum touch target height (and width):
          //   https://material.io/design/usability/accessibility.html#layout-and-typography
          minHeight: 48,
        },
        iconFromProps: {
          textAlign: 'center',
          marginRight: 8,
        },
        iconRightFacingArrow: {
          textAlign: 'center',
          marginLeft: 8,
        },
      }),
    [],
  );

  return (
    <Touchable onPress={onPress}>
      <View style={[styles.container, globalStyles.listItem]}>
        {!!Icon && <Icon size={24} style={[styles.iconFromProps, { color: themeContext.color }]} />}
        <ZulipTextIntl text={label} />
        <View style={globalStyles.rightItem}>
          <IconRight
            size={24}
            style={[styles.iconRightFacingArrow, { color: themeContext.color }]}
          />
        </View>
      </View>
    </Touchable>
  );
}
