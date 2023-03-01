/* @flow strict-local */
import React, { useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { EmojiType, LocalizableReactText } from '../types';
import ZulipTextIntl from './ZulipTextIntl';
import Touchable from './Touchable';
import { IconRight } from './Icons';
import type { SpecificIconType } from './Icons';
import globalStyles, { ThemeContext, createStyleSheet } from '../styles';
import Emoji from '../emoji/Emoji';
import { ensureUnreachable } from '../generics';

type Props = $ReadOnly<{|
  /** An icon or emoji displayed at the left of the row. */
  leftElement?:
    | {|
        +type: 'icon',
        +Component: SpecificIconType,
        +color?: string,
      |}
    | {|
        +type: 'emoji',
        +emojiCode: string,
        +emojiType: EmojiType,
      |},

  title: LocalizableReactText,
  subtitle?: LocalizableReactText,

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
  const { title, subtitle, titleBoldUppercase, onPress, leftElement } = props;

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
        leftElement: {
          marginRight: 8,
        },
        iconFromProps: {
          textAlign: 'center',
        },
        textWrapper: {
          flex: 1,
        },
        title: {
          ...(titleBoldUppercase ? { textTransform: 'uppercase', fontWeight: '500' } : undefined),
        },
        subtitle: {
          fontWeight: '300',
          fontSize: 13,
        },
        iconRightFacingArrow: {
          textAlign: 'center',
          marginLeft: 8,
          color: themeContext.color,
        },
      }),
    [themeContext, titleBoldUppercase],
  );

  return (
    <Touchable onPress={onPress}>
      <View style={styles.container}>
        {leftElement && (
          <View style={styles.leftElement}>
            {(() => {
              switch (leftElement.type) {
                case 'icon':
                  return (
                    <leftElement.Component
                      size={24}
                      style={styles.iconFromProps}
                      color={leftElement.color ?? themeContext.color}
                    />
                  );
                case 'emoji':
                  return (
                    <Emoji size={24} code={leftElement.emojiCode} type={leftElement.emojiType} />
                  );
                default:
                  ensureUnreachable(leftElement.type);
              }
            })()}
          </View>
        )}

        <View style={styles.textWrapper}>
          <ZulipTextIntl style={styles.title} text={title} />
          {subtitle !== undefined && <ZulipTextIntl style={styles.subtitle} text={subtitle} />}
        </View>
        <View style={globalStyles.rightItem}>
          <IconRight size={24} style={styles.iconRightFacingArrow} />
        </View>
      </View>
    </Touchable>
  );
}
