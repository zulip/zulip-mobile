// These classes effectively exist, but are not exported as such.

/** -1: (a < b), 0: (a == b), 1: (a > b) */
declare type Comparator<K> = (a: K, b: K) => -1 | 0 | 1;

// in the actual implementation, these aren't even frozen
declare class RBNode<K, V> {
  +key: K;
  +value: V;
  +left: RBNode<K, V> | null;
  +right: RBNode<K, V> | null;
}

/** immutable ordered multimap */
declare class RedBlackTree<K, V> {
  // this could accept arguments, but we don't use that fact
  constructor(
    compare?: Comparator<K>,
    /* root: Node<K, V> | null, */
  ): RedBlackTree<K, V>;

  // UNDOCUMENTED: The implementation does indeed create and return new lists
  // for keys() and values(); the caller may freely mutate them.
  get keys(): K[];
  get values(): V[];

  get length(): number;
  get(key: K): V | void;

  /** Inserts `value` at `key`. */
  insert(key: K, value: V): RedBlackTree<K, V>;
  /**
   * Removes the first `value` at `key`.
   *
   * UNDOCUMENTED: Returns `this` if `key` is absent.
   */
  remove(key: K): RedBlackTree<K, V>;

  find(key: K): RedBlackTreeIterator<K, V>;

  le(key: K): RedBlackTreeIterator<K, V>;
  lt(key: K): RedBlackTreeIterator<K, V>;
  ge(key: K): RedBlackTreeIterator<K, V>;
  gt(key: K): RedBlackTreeIterator<K, V>;

  /** Iterator pointing to the i^th element. */
  at(i: number): RedBlackTreeIterator<K, V>;

  /** Iterator at the first element. */
  get begin(): RedBlackTreeIterator<K, V>;
  /** Iterator at the last element. (Not C++-style one-past-the-end!) */
  get end(): RedBlackTreeIterator<K, V>;

  // forEach(visitor: (K, V) => void, lo?: K, hi?: K): void;
  forEach(visitor: (K, V) => void): void;
  forEach(visitor: (K, V) => void, lo: K): void;
  forEach(visitor: (K, V) => void, lo: K, hi: K): void;

  get root(): RBNode<K, V>;
}

/** mutable iterator object */
declare class RedBlackTreeIterator<K, V> {
  /** Returns `undefined` if not `valid`. */
  get key(): K;
  /** Returns `undefined` if not `valid`. */
  get value(): V;

  /** Returns `null` if not `valid`. */
  get node(): RBNode<K, V> | null;

  /**
   * Returns the position of this iterator in the sorted sequence of keys.
   * Takes O(log n) time.
   */
  get index(): number;

  get valid(): boolean;

  /** Returns a separately-mutable copy of this iterator. */
  clone(): RedBlackTreeIterator<K, V>;

  /** Returns a new tree without this item. */
  remove(): RedBlackTree<K, V>;

  /** Moves this iterator forward. Mutating. */
  next(): void;
  /** Moves this iterator backward. Mutating. */
  prev(): void;
}

declare module 'functional-red-black-tree' {
  declare export type Comparator<T> = Comparator<T>;

  declare export type RedBlackTree<K, V> = RedBlackTree<K, V>;
  declare export type RedBlackTreeIterator<K, V> = RedBlackTreeIterator<K, V>;

  /**
   * Create a red-black tree with a given comparator.
   *
   * If not specified, a default comparator using `<` will be supplied.
   */
  declare export default function createTree<K, V>(comparator?: Comparator<K>): RedBlackTree<K, V>;
}
