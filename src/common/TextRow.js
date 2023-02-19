/* @flow strict-local */
import * as React from 'react';
import { View } from 'react-native';

import type { LocalizableReactText } from '../types';
import ZulipTextIntl from './ZulipTextIntl';
import Touchable from './Touchable';
import type { SpecificIconType } from './Icons';
import { ThemeContext, createStyleSheet } from '../styles';

type Props = $ReadOnly<{|
  icon?: {|
    +Component: SpecificIconType,
    +color?: string,
  |},

  title: LocalizableReactText,
  subtitle?: LocalizableReactText,

  /** Use this to navigate to a "nested" screen. */
  onPress?: () => void,
|}>;

/**
 * A row with a title, and optional icon, subtitle, and press handler.
 *
 * See also NestedNavRow, SwitchRow, etc.
 */
export default function TextRow(props: Props): React.Node {
  const { title, subtitle, onPress, icon } = props;

  const themeContext = React.useContext(ThemeContext);

  const styles = React.useMemo(
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
        icon: {
          textAlign: 'center',
          marginRight: 8,
          color: icon?.color ?? themeContext.color,
        },
        textWrapper: {
          flex: 1,
        },
        title: {},
        subtitle: {
          fontWeight: '300',
          fontSize: 13,
        },
      }),
    [themeContext, icon],
  );

  const content = (
    <View style={styles.container}>
      {!!icon && <icon.Component size={24} style={styles.icon} />}
      <View style={styles.textWrapper}>
        <ZulipTextIntl style={styles.title} text={title} />
        {subtitle !== undefined && <ZulipTextIntl style={styles.subtitle} text={subtitle} />}
      </View>
    </View>
  );

  return onPress ? <Touchable onPress={onPress}>{content}</Touchable> : content;
}
