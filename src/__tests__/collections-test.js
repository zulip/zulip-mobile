/* @flow strict-local */

const { mapOrNull } = require('../collections');

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
