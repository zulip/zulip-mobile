// @flow strict-local

import { openDatabase } from 'expo-sqlite';
import sqlite3 from 'sqlite3';
import { AsyncStorage } from '../AsyncStorage';

describe('sqlite3', () => {
  test('smoke', async () => {
    const db = new sqlite3.Database(':memory:');
    const result = await new Promise((resolve, reject) => {
      db.get('SELECT 42 as n', (err, row) => (err ? reject(err) : resolve(row)));
    });
    expect(result).toEqual({ n: 42 });
  });
});

/*

describe('AsyncStorage', () => {
  test('getItem settles', async () => {
    // await AsyncStorage.getItem('a');
    expect(true).toBeTruthy();
  });

  //   test('set/get round-trips', async () => {
  //     await AsyncStorage.setItem('a', 'b');
  //     const result = await AsyncStorage.getItem('a');
  //     expect(result).toEqual('b');
  //   });
});
*/

describe('expo-sqlite', () => {
  test('smoke', async () => {
    const db = openDatabase('test.db');
    console.log('opened db');
    const result = await new Promise((resolve, reject) => {
      db.readTransaction(
        tx => {
          tx.executeSql('SELECT 42 AS n', [], (t, r) => resolve(r));
          console.log('tx cb');
        },
        reject,
        resolve,
      );
    });
    expect(result.rows._array).toEqual([{ n: 42 }]);
    expect(true).toBeTruthy();
  });
});
