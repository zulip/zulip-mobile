// @flow strict-local

import { historicalStoreKeys, storeKeys } from '../../boot/store';

describe('historicalStoreKeys', () => {
  test('equals current storeKeys', () => {
    // If this test starts failing, we'll want to clone historicalStoreKeys
    // into one with the old value and one with the new.  See comment there.
    expect(historicalStoreKeys).toEqual(storeKeys);
  });
});
