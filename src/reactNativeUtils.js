/* @flow strict-local */

import React from 'react';
import { AppState } from 'react-native';
import type { AppStateValues } from 'react-native/Libraries/AppState/AppState';
// eslint-disable-next-line id-match
import type { ____ViewStyle_Internal } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import * as logging from './utils/logging';
import type { BoundedDiff } from './generics';
import { typesEquivalent } from './generics';

// A copy of the same-named type in
// node_modules/react-native/Libraries/StyleSheet/StyleSheetTypes.js, for
// use in ViewStylePropWithout, below.
type GenericStyleProp<+T> = null | void | T | false | '' | $ReadOnlyArray<GenericStyleProp<T>>;

/**
 * `View`'s style prop, but without the style attributes defined in T.
 */
// RN's type for `View`'s style prop is `ViewStyleProp` in
// node_modules/react-native/Libraries/StyleSheet/StyleSheet.js; our
// implementation builds on a copy of that.
export type ViewStylePropWithout<T: { ... }> = GenericStyleProp<
  // Uses unsound $Shape just because the upstream type does, and we're
  // copying that.
  $ReadOnly<$Shape<BoundedDiff<____ViewStyle_Internal, T>>>,
>;

/**
 * A hook for AppState's current state value, updated on 'change' events.
 *
 * Gives `null` if the state isn't one of the documented values
 * (AppStateValues), which the upstream types allow for the initial value,
 * and logs to Sentry in that unexpected case.
 */
export function useAppState(): null | AppStateValues {
  // Upstream has `?string`… probably they mean `AppStateValues`, but we'll
  // take them at their word and handle the differences by logging, to
  // prompt investigation if needed:
  // - nullish
  // - some string that's not an AppStateValues
  let initialState = AppState.currentState;

  if (
    initialState == null
    || (typeof initialState === 'string'
      && initialState !== 'inactive'
      && initialState !== 'background'
      && initialState !== 'active')
  ) {
    // If Flow errors here, adjust cases in the conditional.
    typesEquivalent<AppStateValues, 'inactive' | 'background' | 'active'>();
    logging.warn(`Unexpected AppState.currentState: ${initialState?.toString() ?? '[nullish]'}`);
    initialState = null;
  }

  const [value, setValue] = React.useState(initialState);
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', setValue);
    return () => sub.remove();
  }, []);
  return value;
}
