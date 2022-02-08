// @flow strict-local

/**
 * A wrapper around Map, akin to Python's `defaultdict`.
 */
// This could be a subclass of Map instead.  That would also mean it gets
// all the handy methods of Map.
//
// The slightly tricky bit is that that would mean it could enter our Redux
// state where the type says simply `Map`.  So `replaceRevive` would need to
// handle it, and some picky tests might need adjustment too.
//
// We haven't done that yet mainly because we haven't yet had much of a use
// case for using this outside of small local contexts where we don't need
// the other methods of Map.
export default class DefaultMap<K, V> {
  map: Map<K, V> = new Map();
  default: () => V;

  constructor(default_: () => V) {
    this.default = default_;
  }

  /** Return the value at the given key, creating it if necessary. */
  getOrCreate(key: K): V {
    let value = this.map.get(key);
    if (value === undefined) {
      value = this.default();
      this.map.set(key, value);
    }
    return value;
  }
}
