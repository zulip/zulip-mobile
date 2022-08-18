/* @flow strict-local */
import React, { useCallback, useRef, useMemo, useEffect, useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import invariant from 'invariant';
import { CommonActions } from '@react-navigation/native';

import type { LocalizableText } from '../types';
import type { GlobalParamList } from '../nav/globalTypes';
import { randString } from '../utils/misc';
import { createStyleSheet } from '../styles';
import Touchable from './Touchable';
import ZulipTextIntl from './ZulipTextIntl';
import { IconRight } from './Icons';
import type { AppNavigationMethods } from '../nav/AppNavigator';
import { ThemeContext } from '../styles/theme';

type Item<TKey> = $ReadOnly<{|
  key: TKey,
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
|}>;

type Props<TItemKey> = $ReadOnly<{|
  /**
   * Component must be under the stack nav with the selectable-options screen.
   *
   * Pass this down from props or `useNavigation`.
   */
  navigation: AppNavigationMethods,

  /** What the setting is about, e.g., "Theme". */
  label: LocalizableText,

  /** What the setting is about, in a short sentence or two. */
  description?: LocalizableText,

  /** The current value of the input. */
  valueKey: TItemKey,

  /**
   * The available options to choose from, with unique `key`s, one of which
   * must be `valueKey`.
   */
  items: $ReadOnlyArray<Item<TItemKey>>,

  onValueChange: (newValue: TItemKey) => void,
|}>;

/**
 * An input row for the user to make a choice, radio-button style.
 *
 * Shows the current value (the selected item), represented as the item's
 * `.title`. When tapped, opens the selectable-options screen, where the
 * user can change the selection or read more about each selection.
 */
// This has the navigate-to-nested-screen semantics of NestedNavRow,
// represented by IconRight. NestedNavRow would probably be the wrong
// abstraction, though, because it isn't an imput component; it doesn't have
// a value to display.
export default function InputRowRadioButtons<TItemKey: string>(props: Props<TItemKey>): Node {
  const { navigation, label, description, valueKey, items, onValueChange } = props;

  const screenKey: string = useRef(`selectable-options-${randString()}`).current;

  const selectedItem = items.find(c => c.key === valueKey);
  invariant(selectedItem != null, 'InputRowRadioButtons: exactly one choice must be selected');

  const screenParams = useMemo(
    () => ({
      title: label,
      description,
      items: items.map(({ key, title, subtitle, disabled }) => ({
        key,
        title,
        subtitle,
        disabled,
        selected: key === valueKey,
      })),
      onRequestSelectionChange: (itemKey, requestedValue) => {
        if (!requestedValue || itemKey === valueKey) {
          // Can't unselect a radio button.
          return;
        }
        navigation.goBack();
        onValueChange(itemKey);
      },
    }),
    [navigation, label, description, items, valueKey, onValueChange],
  );

  const handleRowPressed = useCallback(() => {
    // Normally we'd use `.push`, to avoid `.navigate`'s funky
    // rewind-history behavior. But `.push` doesn't accept a custom key, so
    // we use `.navigate`. This is fine because the funky rewind-history
    // behavior can't happen here; see
    //   https://github.com/zulip/zulip-mobile/pull/5369#discussion_r868799934
    navigation.navigate({
      name: 'selectable-options',
      key: screenKey,
      params: (screenParams: GlobalParamList['selectable-options']),
    });
  }, [navigation, screenKey, screenParams]);

  // Live-update the selectable-options screen.
  useEffect(() => {
    navigation.dispatch(state =>
      /* eslint-disable operator-linebreak */
      state.routes.find(route => route.key === screenKey)
        ? { ...CommonActions.setParams(screenParams), source: screenKey }
        : // A screen with key `screenKey` isn't currently mounted on the
          // navigator. Don't refer to such a screen; that would be an
          // error.
          CommonActions.reset(state),
    );
  }, [navigation, screenParams, screenKey]);

  // The desired height for IconRight, which we'll pass for its `size` prop.
  // It'll also be its width.
  const kRightArrowIconSize = 24;

  const themeData = useContext(ThemeContext);
  const styles = useMemo(
    () =>
      createStyleSheet({
        wrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 16,

          // Minimum touch target height (and width):
          //   https://material.io/design/usability/accessibility.html#layout-and-typography
          minHeight: 48,
        },
        textWrapper: {
          flex: 1,
          flexDirection: 'column',
        },
        valueTitle: {
          fontWeight: '300',
          fontSize: 13,
        },
        iconRightWrapper: {
          height: kRightArrowIconSize,

          // IconRight is a square, so width equals height and this is the
          // right amount of width to reserve.
          width: kRightArrowIconSize,
        },
      }),
    [],
  );

  return (
    <Touchable onPress={handleRowPressed}>
      <View style={styles.wrapper}>
        <View style={styles.textWrapper}>
          <ZulipTextIntl text={label} />
          <ZulipTextIntl text={selectedItem.title} style={styles.valueTitle} />
        </View>
        <View style={styles.iconRightWrapper}>
          <IconRight size={kRightArrowIconSize} color={themeData.color} />
        </View>
      </View>
    </Touchable>
  );
}
