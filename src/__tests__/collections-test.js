/* @flow strict-local */

import { mapOrNull, symmetricDiff } from '../collections';

describe('mapOrNull', () => {
  test('behaves right in happy case', () => {
    expect(mapOrNull([10, 20], (x, i, a) => x + i + a.length)).toEqual([12, 23]);
  });

  test('returns null on nullish item', () => {
    expect(mapOrNull([1, 2, 3], x => (x === 2 ? null : x))).toEqual(null);
    expect(mapOrNull([1, 2, 3], x => (x === 2 ? undefined : x))).toEqual(null);
  });

  test('aborts on nullish item', () => {
    const log = [];
    mapOrNull([1, 2, 3], x => {
      log.push(x);
      return x === 2 ? null : x;
    });
    expect(log).toEqual([1, 2]);
  });
});

describe('symmetricDiff', () => {
  for (const [desc, as, bs, aOnly, bOnly] of [
    ['empty', [], [], [], []],
    ['empty/inhabited', [], [1, 2], [], [1, 2]],
    ['inhabited/empty', [1, 2], [], [1, 2], []],
    ['equal', [1, 2], [1, 2], [], []],
    ['extra a', [1, 2, 3, 4, 5, 6], [2, 5], [1, 3, 4, 6], []],
    ['extra b', [2, 5], [1, 2, 3, 4, 5, 6], [], [1, 3, 4, 6]],
    ['both extra in same place', [1, 3, 4, 5, 7, 8], [2, 3, 6, 7, 9], [1, 4, 5, 8], [2, 6, 9]],
  ]) {
    test(desc, () => {
      expect(symmetricDiff(as, bs)).toEqual([aOnly, bOnly]);
    });
  }
});
