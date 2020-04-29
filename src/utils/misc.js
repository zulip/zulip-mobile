/* @flow strict-local */

import { objectFromEntries } from '../jsBackport';

export const caseInsensitiveCompareFunc = (a: string, b: string): number =>
  a.toLowerCase().localeCompare(b.toLowerCase());

export const numberWithSeparators = (value: number | string): string =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function deeperMerge<K, V>(obj1: { [K]: V }, obj2: { [K]: V }): { [K]: V } {
  const mergedKeys = Array.from(new Set([...Object.keys(obj1), ...Object.keys(obj2)]));
  return objectFromEntries(
    mergedKeys.map(key =>
      // Prettier bug on nested ternary
      /* prettier-ignore */
      [key,
       obj1[key] === undefined
         ? obj2[key]
         : obj2[key] === undefined
           ? obj1[key]
           : { ...obj1[key], ...obj2[key] }],
    ),
  );
}

export const initialsFromString = (name: string): string =>
  (name.match(/\S+\s*/g) || []).map(x => x[0].toUpperCase()).join('');

export function groupItemsById<T: { +id: number }>(items: T[]): { [id: number]: T } {
  return objectFromEntries(items.map(item => [item.id, item]));
}

export const isValidEmailFormat = (email: string = ''): boolean => /\S+@\S+\.\S+/.test(email);

/**
 * Partition an array into two other arrays, based on a predicate.
 *
 * In particular:
 * - `partition(xs, f)[0]` is equivalent to `xs.filter(f)`
 * - `partition(xs, f)[1]` is equivalent to `xs.filter(i => !f(i))`
 */
export const partition = <T>(
  items: $ReadOnlyArray<T>,
  predicate: T => boolean,
): [Array<T>, Array<T>] => {
  const ret = [[], []];
  for (const item of items) {
    ret[+!predicate(item)].push(item);
  }
  return ret;
};
