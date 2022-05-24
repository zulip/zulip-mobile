/* @flow strict-local */

import React, { useMemo } from 'react';
import type { Node } from 'react';
import { LogBox, View } from 'react-native';

import type { LocalizableText } from '../types';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from './Screen';
import SelectableOptionRow from './SelectableOptionRow';
import ZulipTextIntl from './ZulipTextIntl';
import { createStyleSheet } from '../styles';

type Item<TKey> = $ReadOnly<{|
  key: TKey,
  title: LocalizableText,
  subtitle?: LocalizableText,
  disabled?:
    | {|
        +title: LocalizableText,
        +message?: LocalizableText,
        +learnMoreUrl?: URL,
      |}
    | false,
  selected: boolean,
|}>;

type Props<TItemKey> = $ReadOnly<{|
  navigation: AppNavigationProp<'selectable-options'>,
  route: RouteProp<
    'selectable-options',
    {|
      title: LocalizableText,

      /**
       * An optional explanation, to be shown before the items.
       */
      description?: LocalizableText,

      items: $ReadOnlyArray<Item<TItemKey>>,

      // This param is a function, so React Nav is right to point out that
      // it isn't serializable. But this is fine as long as we don't try to
      // persist navigation state for this screen or set up deep linking to
      // it, hence the LogBox suppression below.
      //
      // React Navigation doesn't offer a more sensible way to have us pass
      // the selection to the calling screen. …We could store the selection
      // as a route param on the calling screen, or in Redux. But from this
      // screen's perspective, that's basically just setting a global
      // variable. Better to offer this explicit, side-effect-free way for
      // the data to flow where it should, when it should.
      onRequestSelectionChange: (itemKey: TItemKey, requestedValue: boolean) => void,
    |},
  >,
|}>;

// React Navigation would give us a console warning about non-serializable
// route params. For more about the warning, see
//   https://reactnavigation.org/docs/5.x/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
// See comment on this param, above.
LogBox.ignoreLogs([/selectable-options > params\.onRequestSelectionChange \(Function\)/]);

/**
 * A screen for selecting items in a list, checkbox or radio-button style.
 *
 * The items and selection state are controlled by the route params. Callers
 * should declare a unique key for their own use of this route, as follows,
 * so that instances can't step on each other:
 *
 * navigation.push({ name: 'selectable-options', key: 'foo', params: { … } })
 * navigation.dispatch({ ...CommonActions.setParams({ … }), source: 'foo' })
 */
// If we need separate components dedicated to checkboxes and radio buttons,
// we can split this. Currently it's up to the caller to enforce the
// radio-button invariant (exactly one item selected) if they want to.
export default function SelectableOptionsScreen<TItemKey: string>(props: Props<TItemKey>): Node {
  const { route } = props;
  const { title, description, items, onRequestSelectionChange } = route.params;

  const styles = useMemo(
    () =>
      createStyleSheet({
        descriptionWrapper: { padding: 16 },
      }),
    [],
  );

  return (
    <Screen title={title} scrollEnabled>
      {description != null && (
        <View style={styles.descriptionWrapper}>
          <ZulipTextIntl text={description} />
        </View>
      )}
      {items.map(item => (
        <SelectableOptionRow
          key={item.key}
          itemKey={item.key}
          title={item.title}
          subtitle={item.subtitle}
          disabled={item.disabled}
          selected={item.selected}
          onRequestSelectionChange={onRequestSelectionChange}
        />
      ))}
    </Screen>
  );
}
