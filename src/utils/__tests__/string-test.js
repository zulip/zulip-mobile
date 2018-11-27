/* @flow strict */

import { transformToEncodedURI } from '../string';

describe('transformToEncodedURI', () => {
  test('if dot is part of encoding, i.e followed by digit then replace it with "%"', () => {
    expect(transformToEncodedURI('some.text')).toEqual('some.text');
    expect(transformToEncodedURI('some.20text')).toEqual('some%20text');
  });
});
