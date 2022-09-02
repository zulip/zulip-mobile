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

  // TODO: Should we make this unconfigurable? Should we have two reusable
  //   components, with and without this?
  labelBoldUppercase?: true,

  /** Use this to navigate to a "nested" screen. */
  onPress: () => void,
|}>;

/**
 * A button that navigates to a "nested" screen.
 *
 * Shows a right-facing arrow to indicate its purpose. If you need a
 * selectable option row instead, use `SelectableOptionRow`.
 */
export default function NestedNavRow(props: Props): Node {
  const { label, labelBoldUppercase, onPress, Icon } = props;

  const themeContext = useContext(ThemeContext);

  const styles = useMemo(
    () =>
      createStyleSheet({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 16,

          // Minimum touch target height (and width):
          //   https://material.io/design/usability/accessibility.html#layout-and-typography
          minHeight: 48,
        },
        iconFromProps: {
          textAlign: 'center',
          marginRight: 8,
          color: themeContext.color,
        },
        label: {
          ...(labelBoldUppercase ? { textTransform: 'uppercase', fontWeight: '500' } : undefined),
        },
        iconRightFacingArrow: {
          textAlign: 'center',
          marginLeft: 8,
          color: themeContext.color,
        },
      }),
    [themeContext, labelBoldUppercase],
  );

  return (
    <Touchable onPress={onPress}>
      <View style={styles.container}>
        {!!Icon && <Icon size={24} style={styles.iconFromProps} />}
        <ZulipTextIntl style={styles.label} text={label} />
        <View style={globalStyles.rightItem}>
          <IconRight size={24} style={styles.iconRightFacingArrow} />
        </View>
      </View>
    </Touchable>
  );
}
