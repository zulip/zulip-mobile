/* @flow strict-local */

import { NumericMap } from '../numeric-map';
import { objectFromEntries } from '../../jsBackport';

describe('NumericMap', () => {
  const data_entries: [number, string][] = [
    [1, 'one'],
    [2, 'two'],
    [3, 'three'],
    [4, 'four'],
    [5, 'five'],
  ];
  const data_object: { [number]: string } = objectFromEntries(data_entries);

  test('can be constructed from entries', () => {
    const map = NumericMap.fromEntries(data_entries);
    expect(map.size).toBe(data_entries.length);
  });

  test('can be constructed from a map-object', () => {
    const map = NumericMap.fromObject(data_object);
    expect(map.size).toBe(Object.keys(data_object).length);
  });

  test('can have values inserted and retrieved', () => {
    const map = new NumericMap<number, string>().set(0, 'zero').set(1, 'one');

    expect(map.get(0)).toBe('zero');
    expect(map.get(1)).toBe('one');
  });

  test('is immutable', () => {
    const map = new NumericMap<number, string>();
    const map2 = map.set(0, 'zero');

    expect(map).not.toBe(map2);
    expect(map.has(0)).toBeFalse();
    expect(map2.has(0)).toBeTrue();
  });

  test('is not a multimap', () => {
    const map = new NumericMap<number, string>() /* force newline */
      .set(0, 'zero')
      .set(0, 'not zero');
    expect(map.get(0)).toBe('not zero');

    const map2 = map.delete(0);
    expect(map2.get(0)).toBeUndefined();
  });

  test("can't insert NaN as a key", () => {
    const map = new NumericMap<number, string>();
    expect(() => map.set(0 / 0, 'NaN')).toThrow();
  });

  test("can't insert NaN as a key with fromEntries", () => {
    expect(() => NumericMap.fromEntries([[0 / 0, 'NaN']])).toThrow();
  });

  describe('(with known map)', () => {
    const data_map = NumericMap.fromEntries(data_entries);

    test('.entries()', () => {
      // entries() should be a generator function
      expect(data_map.entries()).not.toBeArray();

      for (const [k, v] of data_map.entries()) {
        expect(data_map.get(k)).toBe(v);
        expect(data_object[k]).toBe(v);
      }

      expect([...data_map.entries()].length).toBe(data_entries.length);
    });

    test('.keys()', () => {
      const keys = data_map.keys();
      expect(keys.length).toBe(data_entries.length);
      for (const key of keys) {
        expect(data_map.has(key)).toBeTrue();
      }
    });

    test('.values()', () => {
      const values = data_map.values();
      expect(values.length).toBe(data_entries.length);
      for (const value of values) {
        expect(typeof value).toBe('string');
      }
    });

    test('.size()', () => {
      expect(data_map.size).toBe(data_entries.length);
      expect(data_map.set(9, 'nine').size).toBe(data_entries.length + 1);
      expect(data_map.delete(8).size).toBe(data_entries.length);
      expect(data_map.set(1, 'ONE').size).toBe(data_entries.length);
    });
  });
});
