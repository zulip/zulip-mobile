// @flow strict-local

import { openDatabase } from 'expo-sqlite';
import sqlite3 from 'sqlite3';
import { AsyncStorage } from '../AsyncStorage';

/* eslint-disable no-underscore-dangle */

describe('sqlite3', () => {
  test('smoke', async () => {
    const db = new sqlite3.Database(':memory:');
    const result = await new Promise((resolve, reject) => {
      db.get('SELECT 42 as n', (err, row) => (err ? reject(err) : resolve(row)));
    });
    expect(result).toEqual({ n: 42 });
  });
});

describe('expo-sqlite', () => {
  test('smoke', async () => {
    const db = openDatabase('test.db');
    const result = await new Promise((resolve, reject) => {
      db.readTransaction(
        tx => {
          tx.executeSql('SELECT 42 AS n', [], (t, r) => resolve(r));
        },
        reject,
        resolve,
      );
    });
    expect(result.rows._array).toEqual([{ n: 42 }]);
  });
});

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
