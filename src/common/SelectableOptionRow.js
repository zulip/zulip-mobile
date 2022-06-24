/* @flow strict-local */
import React, { useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { useGlobalSelector } from '../react-redux';
import type { LocalizableText } from '../types';
import ZulipTextIntl from './ZulipTextIntl';
import Touchable from './Touchable';
import { BRAND_COLOR, createStyleSheet, HALF_COLOR, ThemeContext } from '../styles';
import { IconDone } from './Icons';
import { showErrorAlert } from '../utils/info';
import { TranslationContext } from '../boot/TranslationProvider';
import { getGlobalSettings } from '../directSelectors';

type Props<TItemKey: string | number> = $ReadOnly<{|
  // A key to uniquely identify the item. The function passed as
  // `onRequestSelectionChange` gets passed this. We would have just
  // called this `key` except that would collide with React's builtin
  // `key` attribute (which callers should also pass if they're in a
  // position that requires it).
  itemKey: TItemKey,

  title: LocalizableText,
  subtitle?: LocalizableText,
  disabled?:
    | {|
        +title: LocalizableText,
        +message?: LocalizableText,
        +learnMoreButton?: {|
          +url: URL,
          +text?: LocalizableText,
        |},
      |}
    | false,
  selected: boolean,

  // We might have called this `onPress`, but
  // - pressing just happens to be how this component wants the user
  //   to manually select/deselect
  // - callers don't have a license to do whatever they want here; see
  //   note in jsdoc
  onRequestSelectionChange: (itemKey: TItemKey, requestedValue: boolean) => void,
|}>;

// The desired height of the checkmark icon, which we'll pass for its `size`
// prop. It'll also be its width, since it's a square.
const kCheckmarkSize = 24;

/**
 * A labeled row for an item among related items; shows a checkmark
 *   when selected.
 *
 * NOTE: This isn't an all-purpose action button. The component has
 * two essential states: selected and deselected. These must clearly
 * represent two states in the app; e.g., for each supported language,
 * it is either active or not. The event handler shouldn't do random
 * things that aren't related to that state, like navigating to a
 * different screen.
 */
export default function SelectableOptionRow<TItemKey: string | number>(
  props: Props<TItemKey>,
): Node {
  const { itemKey, title, subtitle, selected, onRequestSelectionChange, disabled = false } = props;

  const globalSettings = useGlobalSelector(getGlobalSettings);

  const _ = useContext(TranslationContext);
  const themeData = useContext(ThemeContext);

  const styles = useMemo(
    () =>
      createStyleSheet({
        textWrapper: {
          flex: 1,
          flexDirection: 'column',
        },

        // Reserve a space for the checkmark so the layout (e.g., word
        // wrapping of the subtitle) doesn't change when `selected` changes.
        checkmarkWrapper: {
          height: kCheckmarkSize,

          // The checkmark icon is a square, so width equals height and this
          // is the right amount of width to reserve.
          width: kCheckmarkSize,
        },

        title: {
          color: disabled ? HALF_COLOR : themeData.color,
        },
        subtitle: {
          color: disabled ? HALF_COLOR : themeData.color,
          fontWeight: '300',
          fontSize: 13,
        },
        wrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 16,
          paddingRight: 16,
        },
      }),
    [disabled, themeData.color],
  );

  return (
    <Touchable
      onPress={() => {
        if (disabled) {
          const { title, message, learnMoreButton } = disabled; // eslint-disable-line no-shadow
          showErrorAlert(
            _(title),
            message != null ? _(message) : undefined,
            learnMoreButton && {
              url: learnMoreButton.url,
              text: learnMoreButton.text != null ? _(learnMoreButton.text) : undefined,
              globalSettings,
            },
          );
          return;
        }

        onRequestSelectionChange(itemKey, !selected);
      }}
    >
      <View style={styles.wrapper}>
        <View style={styles.textWrapper}>
          <ZulipTextIntl text={title} style={styles.title} />
          {subtitle !== undefined && <ZulipTextIntl text={subtitle} style={styles.subtitle} />}
        </View>
        <View style={styles.checkmarkWrapper}>
          {selected && <IconDone size={kCheckmarkSize} color={BRAND_COLOR} />}
        </View>
      </View>
    </Touchable>
  );
}
