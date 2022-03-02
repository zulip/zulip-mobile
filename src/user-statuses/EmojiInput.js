/* @flow strict-local */
import React, { useContext, useCallback, useMemo } from 'react';
import type { Node } from 'react';
import { Platform } from 'react-native';
import type { AppNavigationProp } from '../nav/AppNavigator';

import { ThemeContext } from '../styles/theme';
import Touchable from '../common/Touchable';
import Emoji from '../emoji/Emoji';
import { Icon } from '../common/Icons';
import type { EmojiType } from '../types';
import { createStyleSheet, BORDER_COLOR } from '../styles';

export type Value = null | {| +type: EmojiType, +code: string, +name: string |};

export type Props = $ReadOnly<{|
  value: Value,
  onChangeValue: Value => void,

  /**
   * Component must be under the stack nav that has the emoji-picker screen
   *
   * Pass this down from props or `useNavigation`.
   */
  navigation: AppNavigationProp<>,

  /**
   * Give appropriate right margin
   */
  rightMargin?: true,
|}>;

/**
 * A controlled input component to let the user choose an emoji.
 *
 * When pressed, opens the emoji-picker screen, and populates with the emoji
 * chosen by the user, if any.
 *
 * Designed for harmony with our Input component. If changing the appearance
 * of this or that component, we should try to keep that harmony.
 */
export default function EmojiInput(props: Props): Node {
  const { value, onChangeValue, navigation, rightMargin } = props;

  const { color } = useContext(ThemeContext);

  const handlePress = useCallback(() => {
    navigation.push('emoji-picker', { onPressEmoji: onChangeValue });
  }, [navigation, onChangeValue]);

  const styles = useMemo(
    () =>
      createStyleSheet({
        touchable: {
          // Min touch-target size
          minWidth: 48,
          minHeight: 48,

          alignItems: 'center',
          justifyContent: 'center',

          marginRight: rightMargin ? 4 : undefined,

          // For harmony with the `Input` component, which differs between
          // platforms because of platform conventions. Border on iOS, no
          // border on Android.
          ...(Platform.OS === 'ios'
            ? {
                borderWidth: 1,
                borderColor: BORDER_COLOR,
                borderRadius: 2,
                padding: 8,
              }
            : Object.freeze({})),
        },
      }),
    [rightMargin],
  );

  return (
    <Touchable style={styles.touchable} onPress={handlePress}>
      {value ? (
        <Emoji code={value.code} type={value.type} size={24} />
      ) : (
        <Icon color={color} size={24} name="smile" />
      )}
    </Touchable>
  );
}
