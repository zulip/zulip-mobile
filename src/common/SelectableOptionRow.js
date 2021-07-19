/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';

import { RawLabel, Touchable } from '.';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { IconDone } from './Icons';

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  subtitle: {
    fontWeight: '300',
    fontSize: 13,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
  },
});

type Props<TItemKey: string | number> = $ReadOnly<{|
  // A key to uniquely identify the item. The function passed as
  // `onRequestSelectionChange` gets passed this. We would have just
  // called this `key` except that would collide with React's builtin
  // `key` attribute (which callers should also pass if they're in a
  // position that requires it).
  itemKey: TItemKey,

  title: string,
  subtitle?: string,
  selected: boolean,

  // We might have called this `onPress`, but
  // - pressing just happens to be how this component wants the user
  //   to manually select/deselect
  // - callers don't have a license to do whatever they want here; see
  //   note in jsdoc
  onRequestSelectionChange: (itemKey: TItemKey, requestedValue: boolean) => void,
|}>;

/**
 * A labeled row for an item among related items; shows a checkmark
 *   when selected.
 *
 * NOTE: This isn't an all-purpose action button. The component has
 * two essential states: selected and deselected. These must clearly
 * represent two states in the app; e.g., for each supported locale,
 * it is either active or not. The event handler shouldn't do random
 * things that aren't related to that state, like navigating to a
 * different screen.
 */
export default function SelectableOptionRow<TItemKey: string | number>(
  props: Props<TItemKey>,
): React$Node {
  const { itemKey, title, subtitle, selected, onRequestSelectionChange } = props;

  return (
    <Touchable onPress={() => onRequestSelectionChange(itemKey, !selected)}>
      <View style={styles.listItem}>
        <View style={styles.wrapper}>
          <RawLabel text={title} />
          {subtitle !== undefined && <RawLabel text={subtitle} style={styles.subtitle} />}
        </View>
        <View>{selected && <IconDone size={16} color={BRAND_COLOR} />}</View>
      </View>
    </Touchable>
  );
}
