/* @flow strict-local */

import { objectFromEntries } from '../jsBackport';

describe('objectFromEntries', () => {
  test('basic', () => {
    expect(
      objectFromEntries([['number', 1], ['null', null], ['obj', {}], ['undef', undefined]]),
    ).toStrictEqual({ number: 1, null: null, obj: {}, undef: undefined });
  });
});
