/* @flow strict-local */

// eslint-disable-next-line id-match
import type { ____ViewStyle_Internal } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import type { BoundedDiff } from './generics';

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
