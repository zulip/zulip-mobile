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
          // At this point no actual SQL has been attempted yet; but this
          // log line isn't reached, even though the one above is.  Perhaps
          // the "immediate" implementation this library uses isn't playing
          // well with Jest.
          console.log('tx cb 1');
          tx.executeSql('SELECT 42 AS n', [], (t, r) => resolve(r));
          console.log('tx cb 2');
        },
        reject,
        resolve,
      );
    });
    expect(result).toEqual(null);
    expect(true).toBeTruthy();
  });
});
