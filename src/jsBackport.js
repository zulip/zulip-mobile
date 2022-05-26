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
    obj[entry[0]] = entry[1];
  });
  return obj;
}

/**
 * A simplified version of Promise#allSettled.
 *
 * See doc on MDN:
 *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
 *
 * This version is simplified for convenient implementation and because we
 * didn't happen to need the extra features:
 *  * The argument must be an `Array`.
 *  * No details about the promises' outcomes are provided.
 */
export function allSettled(promises: $ReadOnlyArray<Promise<mixed>>): Promise<void> {
  const total = promises.length;
  if (total === 0) {
    return Promise.resolve();
  }

  let completed = 0;
  return new Promise(resolve => {
    promises.forEach(async p => {
      try {
        await p;
      } finally {
        completed++;
        if (completed === total) {
          resolve();
        }
      }
    });
  });
}
