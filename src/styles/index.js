/* @flow strict-local */
// eslint-disable-next-line id-match
import type { ____Styles_Internal } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import composeBoxStyles from './composeBoxStyles';
import { statics as miscStyles } from './miscStyles';
import { statics as navStyles } from './navStyles';
import utilityStyles from './utilityStyles';

export * from './constants';
export type { ThemeData } from './theme';
export { ThemeContext } from './theme';

/**
 * Use instead of StyleSheet.create.
 *
 * The upstream StyleSheet.create does precisely nothing in release mode.
 * In debug mode it does some runtime checks that are redundant with the
 * type-checker, and applies Object.freeze.  The useful things it does are
 * entirely at the source-code level:
 *  * It makes explicit that this is supposed to be a bunch of styles.
 *  * It tells Flow up front that this is supposed to be a bunch of styles.
 *    In most cases we'll go on to use the styles someplace with an
 *    appropriate type and so Flow would give an error just fine without
 *    using any function like this, but it can be handy if the style is
 *    passed someplace with an unfortunate `any` type.
 *
 * Unfortunately the upstream StyleSheet.create also defeats all
 * type-checking on the styles it returns, marking them all as type `any`.
 *
 * This function does the useful things from StyleSheet.create, plus
 * unconditionally applies Object.freeze.  And then it passes through the
 * styles' actual types unchanged.
 */
// The name ____Styles_Internal is kind of hilarious, yes.  The type it
// actually refers to is: an object where each property's type is a certain
// object type, an exact object type with all properties optional.  That
// type has the also-hilarious name ____DangerouslyImpreciseStyle_Internal;
// but it's just what you get by spreading together all the different style
// types.  Which makes it also the least upper bound, among plain object
// types (i.e. not including union types), of all the different style types.
export function createStyleSheet<+S: ____Styles_Internal>(obj: S): S {
  return Object.freeze(obj);
}

// By `Object.freeze`, we really mean `createStyleSheet`. But that's too
// much for Flow in types-first mode, and it can't tell the exported
// object's type on a quick skim. But apparently it has no problem if we
// just do an `Object.freeze` directly. So, do that, and get
// `createStyleSheet` to type-check the contents of `styles` separately, in
// a trivial bit of code below.
const styles = Object.freeze({
  ...composeBoxStyles,
  ...miscStyles,
  ...navStyles,
  ...utilityStyles,
});

// Check the contents of `styles` (see comment above).
// eslint-disable-next-line no-unused-expressions
() => createStyleSheet(styles);

export default styles;
