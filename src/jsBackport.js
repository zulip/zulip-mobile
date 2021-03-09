/**
 * Backports of handy functions from newer (or proposed) versions of JavaScript.
 *
 * Almost like polyfills -- except rather than actually muck with names and
 * objects that belong to the standard library, we give our versions their
 * own distinct names.
 *
 * @flow strict-local
 */

/**
 * Backport of `Object.fromEntries`.
 *
 * See documentation on MDN:
 *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
 *
 * This version requires an `Array` just because that was easiest to
 * implement and is all we happened to need.  Would be nice to extend to
 * iterables.
 */
export function objectFromEntries<+K, +V>(entries: $ReadOnlyArray<[K, V]>): {| [K]: V |} {
  const obj = ({}: {| [K]: V |});
  entries.forEach(entry => {
    // ESLint bug?  I don't understand how this rule even applies to this line.
    // eslint-disable-next-line prefer-destructuring
    obj[entry[0]] = entry[1];
  });
  return obj;
}
