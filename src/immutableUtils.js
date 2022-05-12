/** General helpers to augment Immutable.js. */
// @flow strict-local

import Immutable from 'immutable';

// Like `Immutable.Map#update`, but prune returned values equal to `zero`.
export function updateAndPrune<K, V>(
  map: Immutable.Map<K, V>,
  zero: V,
  key: K,
  updater: (V | void) => V,
): Immutable.Map<K, V> {
  const value = map.get(key);
  const newValue = updater(value);
  if (newValue === zero) {
    return map.delete(key);
  }
  if (newValue === value) {
    return map;
  }
  return map.set(key, newValue);
}

// Like `Immutable.Map#map`, but with the update-only-if-different semantics
// of `Immutable.Map#update`.  Kept for comparison to `updateAllAndPrune`.
export function updateAll<K, V>(map: Immutable.Map<K, V>, updater: V => V): Immutable.Map<K, V> {
  return map.withMutations(mapMut => {
    map.forEach((value, key) => {
      const newValue = updater(value);
      if (newValue !== value) {
        mapMut.set(key, newValue);
      }
    });
  });
}

// Like `updateAll`, but prune values equal to `zero` given by `updater`.
export function updateAllAndPrune<K, V>(
  map: Immutable.Map<K, V>,
  zero: V,
  updater: V => V,
): Immutable.Map<K, V> {
  return map.withMutations(mapMut => {
    map.forEach((value, key) => {
      const newValue = updater(value);
      if (newValue === zero) {
        mapMut.delete(key);
        return;
      }
      if (newValue === value) {
        return; // i.e., continue
      }
      mapMut.set(key, newValue);
    });
  });
}

/**
 * The union of sets, represented as sorted lists.
 *
 * The inputs must be sorted (by `<`) and without duplicates (by `===`).
 *
 * The output will contain all the elements found in either input, again
 * sorted and without duplicates.
 */
// TODO: This implementation is Θ(n log n), because it repeatedly looks up
//   elements by numerical index.  It would be nice to instead use cursors
//   within the tree to get an O(n) implementation.
export function setUnion<T: number>(
  xs: Immutable.List<T>,
  ys: Immutable.List<T>,
): Immutable.List<T> {
  // TODO: Perhaps build a List directly, with setSize up front.
  const result = [];
  let i = 0;
  let x = xs.get(i++);
  let j = 0;
  let y = ys.get(j++);
  while (x !== undefined && y !== undefined) {
    if (x < y) {
      result.push(x);
      x = xs.get(i++);
    } else if (x !== y) {
      result.push(y);
      y = ys.get(j++);
    } else {
      // x === y
      result.push(x);
      x = xs.get(i++);
      y = ys.get(j++);
    }
  }
  while (x !== undefined) {
    result.push(x);
    x = xs.get(i++);
  }
  while (y !== undefined) {
    result.push(y);
    y = ys.get(j++);
  }
  return Immutable.List(result);
}
