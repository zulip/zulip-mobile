// @flow strict-local

import { AsyncStorage } from '../AsyncStorage';

describe('AsyncStorage', () => {
  test('set/get round-trips', async () => {
    await AsyncStorage.setItem('a', 'b');
    const result = await AsyncStorage.getItem('a');
    expect(result).toEqual('b');
  });
});
