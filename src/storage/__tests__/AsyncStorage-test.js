// @flow strict-local

import { AsyncStorage } from '../AsyncStorage';

/* eslint-disable no-underscore-dangle */

describe('AsyncStorage', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  test('getItem / setItem', async () => {
    expect(await AsyncStorage.getItem('a')).toEqual(null);

    await AsyncStorage.setItem('a', '1');
    expect(await AsyncStorage.getItem('a')).toEqual('1');

    await AsyncStorage.setItem('a', '2');
    expect(await AsyncStorage.getItem('a')).toEqual('2');

    expect(await AsyncStorage.getItem('b')).toEqual(null);
  });

  test('multiSet', async () => {
    await AsyncStorage.multiSet([
      ['a', '1'],
      ['b', '2'],
    ]);
    expect(await AsyncStorage.getItem('a')).toEqual('1');
    expect(await AsyncStorage.getItem('b')).toEqual('2');
  });

  test('removeItem', async () => {
    await AsyncStorage.setItem('a', '1');
    expect(await AsyncStorage.getItem('a')).toEqual('1');
    await AsyncStorage.removeItem('a');
    expect(await AsyncStorage.getItem('a')).toEqual(null);
    await AsyncStorage.removeItem('a');
    expect(await AsyncStorage.getItem('a')).toEqual(null);
  });

  test('getAllKeys', async () => {
    await AsyncStorage.setItem('a', '1');
    await AsyncStorage.setItem('b', '2');
    expect(await AsyncStorage.getAllKeys()).toEqual(['a', 'b']);
  });

  test('clear', async () => {
    await AsyncStorage.setItem('a', '1');
    await AsyncStorage.setItem('b', '2');
    expect(await AsyncStorage.getAllKeys()).toEqual(['a', 'b']);
    await AsyncStorage.clear();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });
});
