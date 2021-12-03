// @flow strict-local

// $FlowFixMe[missing-export] -- present in test version of module
import { deleteDatabase } from 'expo-sqlite';
import LegacyAsyncStorage from '@react-native-async-storage/async-storage';

import { AsyncStorage } from '../AsyncStorage';
import { SQLDatabase } from '../sqlite';

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

describe('AsyncStorage: migration from legacy AsyncStorage', () => {
  beforeAll(async () => {
    await AsyncStorage.devForgetState();
    await deleteDatabase('zulip.db');
    await LegacyAsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.devForgetState();
    await deleteDatabase('zulip.db');
    await LegacyAsyncStorage.clear();
  });

  test('with no legacy data', async () => {
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test('with legacy data', async () => {
    LegacyAsyncStorage.setItem('a', '1');
    LegacyAsyncStorage.setItem('b', '2');
    expect(await AsyncStorage.getAllKeys()).toEqual(['a', 'b']);
    expect(await AsyncStorage.getItem('a')).toEqual('1');
    expect(await AsyncStorage.getItem('b')).toEqual('2');

    // Make some updates, then simulate the program exiting and restarting.
    await AsyncStorage.setItem('c', '3');
    await AsyncStorage.removeItem('b');
    await AsyncStorage.devForgetState();

    // Expect to still get the updated state, not a newly-re-migrated state.
    expect(await AsyncStorage.getAllKeys()).toEqual(['a', 'c']);
    expect(await AsyncStorage.getItem('a')).toEqual('1');
    expect(await AsyncStorage.getItem('c')).toEqual('3');
  });

  test('with legacy data and failed migration', async () => {
    LegacyAsyncStorage.setItem('a', '1');
    LegacyAsyncStorage.setItem('b', '2');
    expect(await AsyncStorage.getAllKeys()).toEqual(['a', 'b']);

    // Simulate the migration having not completed:
    // Pretend one of the keys didn't make it over…
    await AsyncStorage.removeItem('b');
    await AsyncStorage.devForgetState();
    const db = new SQLDatabase('zulip.db');
    await db.transaction(tx => {
      // … and that the migration didn't record success.
      tx.executeSql('DELETE FROM migration');
    });

    // Expect to get the original legacy data, re-migrated.
    expect(await AsyncStorage.getAllKeys()).toEqual(['a', 'b']);
    expect(await AsyncStorage.getItem('a')).toEqual('1');
    expect(await AsyncStorage.getItem('b')).toEqual('2');
  });
});
