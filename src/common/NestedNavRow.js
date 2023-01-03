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
  icon?: {|
    +Component: SpecificIconType,
    +color?: string,
  |},

  title: LocalizableReactText,

  // TODO: Should we make this unconfigurable? Should we have two reusable
  //   components, with and without this?
  titleBoldUppercase?: true,

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
  const { title, titleBoldUppercase, onPress, icon } = props;

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
          color: icon?.color ?? themeContext.color,
        },
        title: {
          ...(titleBoldUppercase ? { textTransform: 'uppercase', fontWeight: '500' } : undefined),
        },
        iconRightFacingArrow: {
          textAlign: 'center',
          marginLeft: 8,
          color: themeContext.color,
        },
      }),
    [themeContext, icon, titleBoldUppercase],
  );

  return (
    <Touchable onPress={onPress}>
      <View style={styles.container}>
        {!!icon && <icon.Component size={24} style={styles.iconFromProps} />}
        <ZulipTextIntl style={styles.title} text={title} />
        <View style={globalStyles.rightItem}>
          <IconRight size={24} style={styles.iconRightFacingArrow} />
        </View>
      </View>
    </Touchable>
  );
}
