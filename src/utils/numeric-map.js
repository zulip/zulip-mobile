/* @flow strict-local */
// flowlint unsafe-getters-setters: off

import createRBTree from 'functional-red-black-tree';
import type { RedBlackTree, RedBlackTreeIterator } from 'functional-red-black-tree';

// export type { Comparator } from 'functional-red-black-tree';

const IMPL_PROTOTYPE = Object.getPrototypeOf(createRBTree());

/** implementation-dependent: recognize object from interior implementation */
const isImpl = (val: $Diff<mixed, null | void>): boolean =>
  Object.getPrototypeOf(val) === IMPL_PROTOTYPE;

/** Convenience function: throw if argument is NaN. */
const assertNotNaN = (val: number) => {
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(val)) {
    throw new RangeError('NumericMap: cannot use NaN as a key');
  }
};

/**
 * Immutable ordered map.
 *
 * The value type may be any type which excludes `undefined`.
 */
export class NumericMap<K: number, V: $NonMaybeType<mixed> | null> {
  _tree: RedBlackTree<K, V>;

  /** Constructor. External callers should not supply a value here. */
  constructor(val?: RedBlackTree<K, V>) {
    if (arguments.length === 0) {
      // external caller
      this._tree = createRBTree();
    } else if (val && isImpl(val)) {
      // just wrapping underlying implementation
      this._tree = val;
    } else {
      throw new Error(
        'NumericMap constructor called with improper value',
        /* and Flow should have complained about it */
      );
    }
  }

  /**
   * Alternate constructor. Create from a list of entries.
   */
  static fromEntries(entries: [K, V][]): NumericMap<K, V> {
    const tree = entries.reduce((_tree: RedBlackTree<K, V>, [k, v]: [K, V]) => {
      assertNotNaN(k);
      return _tree.remove(k).insert(k, v);
    }, createRBTree());
    return new NumericMap(tree);
  }

  // Auxiliary function: convert string to number, or throw.
  static _as_number(value: string): number {
    // See: https://stackoverflow.com/a/35759874
    const converted = parseFloat(value);
    // eslint-disable-next-line no-restricted-globals
    if (value !== value.trim() || isNaN(value) || isNaN(converted)) {
      throw new Error(`NumericMap.fromObject: string ${JSON.stringify(value)} is not a number`);
    }
    return converted;
  }

  /**
   * Convenience function: convert from an existing map-object.
   *
   * (Prefer `fromEntries` wherever feasible; it's more honestly typed.)
   */
  static fromObject(obj: { [K]: V }): NumericMap<K, V> {
    let tree = createRBTree();
    for (const k of Object.keys(obj)) {
      const key = this._as_number(k);
      // $FlowFixMe: number/string key confusion
      const val: V = obj[k];
      tree = tree.insert(key, val);
    }
    return new NumericMap(tree);
  }

  keys(): K[] {
    return this._tree.keys;
  }
  values(): V[] {
    return this._tree.values;
  }
  get size(): number {
    return this._tree.length;
  }

  /**
   * Generator. Retrieve each key-value pair, in ascending order by key.
   *
   * `lo` and `hi` may be optionally specified to only iterate over a subrange.
   * This range is taken to be inclusive on both sides: [lo, hi].
   */
  * entries(lo?: K | void, hi?: K | void): Generator<[K, V], void, empty> {
    const iter: RedBlackTreeIterator<K, V> =
      lo === undefined ? this._tree.begin : this._tree.ge(lo);
    if (hi !== undefined) {
      // loop until value greater than hi, or end
      while (iter.valid) {
        const val = iter.value;
        if (val > hi) {
          return;
        }
        yield [iter.key, val];
        iter.next();
      }
    } else {
      // loop until end
      while (iter.valid) {
        yield [iter.key, iter.value];
        iter.next();
      }
    }
  }

  /** True if `key` has an associated value in this map. */
  has(key: K): boolean {
    return this._tree.find(key).valid;
  }
  /** Returns the associated value, or `undefined` if no such value exists. */
  get(key: K): V | void {
    const iter = this._tree.find(key);
    return iter === null ? undefined : iter.value;
  }

  /** Returns `this` if this has no effect. */
  set(key: K, value: V): NumericMap<K, V> {
    assertNotNaN(key);
    const iter = this._tree.find(key);
    // eslint-disable-next-line no-restricted-globals
    if (iter === null) {
      return new NumericMap(this._tree.insert(key, value));
    } else if (iter.value === value) {
      return this;
    } else {
      return new NumericMap(this._tree.remove(key).insert(key, value));
    }
  }

  /** Returns `this` if this has no effect. */
  delete(key: K): NumericMap<K, V> {
    // We exploit the fact that the underlying impl has the same guarantee.
    const tree = this._tree.remove(key);
    return tree === this._tree ? this : new NumericMap<K, V>(tree);
  }

  // toJSON() { ... }
}
