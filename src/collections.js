/**
 * Handy generic functions for operating on JS collections.
 *
 * Any function here is the sort of thing that perhaps should be in the
 * language's standard library, or is just a bit too algorithmical for that.
 *
 * See also
 *  * `jsBackport.js`, for things that actually are in newer versions of JS,
 *    or late-stage proposals for future versions
 *  * `generics.js`, for things that operate on types
 *
 * @flow strict-local
 */

/**
 * Like `Array#map`, but returns null if `f` ever returns a nullish value.
 *
 * If `f` returns nullish at any element, the iteration stops and `f` is not
 * called on any later elements.
 *
 * This replaces either (a) writing an explicit loop, in order to be able to
 * abort on a nullish value, or (b) using `Array#map` and then running
 * through the list again to look for nullish values.
 */
export function mapOrNull<T, U>(
  array: $ReadOnlyArray<T>,
  f: (T, number, $ReadOnlyArray<T>) => U,
  // `Array#map` has one more parameter, "thisArg".  Skipping that because
  //   it seems like there isn't a way to type it properly in Flow (flowlib
  //   has `any`), and we haven't had a need for it.
): Array<$NonMaybeType<U>> | null {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    const r = f(array[i], i, array);
    if (r == null) {
      return null;
    }
    result.push(r);
  }
  return result;
}

/**
 * Find items that are in one but not both of the given arrays.
 *
 * The two returned arrays consist of items in only the first array, and
 * items in only the second array, respectively.
 *
 * Both input arrays must be sorted.  The output arrays will also be sorted.
 *
 * This function takes linear time, i.e., O(as.length + bs.length).
 *
 * (The implementation would work just as well for strings; it only needs
 * `<`.  The type is narrower just because `number | string` would mean
 * comparing numbers and strings to each other, which in JS is no good.)
 */
// prettier-ignore
export function symmetricDiff(
  as: $ReadOnlyArray<number>,
  bs: $ReadOnlyArray<number>,
): [number[], number[]] {
  /* eslint-disable one-var */
  const aOnly = [], bOnly = [];
  let ia = 0, ib = 0;
  while (ia < as.length && ib < bs.length) {
    const a = as[ia], b = bs[ib];
    if    (a === b) { ia++; ib++; }
    else if (a < b) { aOnly.push(a); ia++; }
    else            { bOnly.push(b); ib++; }
  }
  if      (ia < as.length) { aOnly.push(...as.slice(ia)); }
  else if (ib < bs.length) { bOnly.push(...bs.slice(ib)); }
  return [aOnly, bOnly];
}
