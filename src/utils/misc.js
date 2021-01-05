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

export const isValidEmailFormat = (email: string = ''): boolean => /\S+@\S+\.\S+/.test(email);
