/* @flow */

import { replaceAtIndex, transformToEncodedURI } from '../string';

describe('replaceAtIndex', () => {
  test('replace char in given string at particular index', () => {
    expect(replaceAtIndex('play', 0, 'c')).toEqual('clay');
    expect(replaceAtIndex('some.text', 4, '%')).toEqual('some%text');
  });
});

describe('transformToEncodedURI', () => {
  test('if dot is part of encoding, i.e followed by digit then replace it with "%"', () => {
    expect(transformToEncodedURI('some.text')).toEqual('some.text');
    expect(transformToEncodedURI('some.20text')).toEqual('some%20text');
  });
});
