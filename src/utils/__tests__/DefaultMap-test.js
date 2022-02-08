// @flow strict-local

import DefaultMap from '../DefaultMap';

describe('DefaultMap', () => {
  test('smoke', () => {
    const m = new DefaultMap(() => []);
    expect([...m.map.entries()].sort()).toEqual([]);

    // Create a value.
    m.getOrCreate('a').push(1);
    expect([...m.map.entries()].sort()).toEqual([['a', [1]]]);

    // Different key gets a fresh value.
    m.getOrCreate('b').push(2);
    // prettier-ignore
    expect([...m.map.entries()].sort()).toEqual([['a', [1]], ['b', [2]]]);

    // Existing key gets the existing value.
    m.getOrCreate('a').push(3);
    // prettier-ignore
    expect([...m.map.entries()].sort()).toEqual([['a', [1, 3]], ['b', [2]]]);
  });
});
