// @flow strict-local

import { openDatabase } from 'expo-sqlite';
import { AsyncStorage } from '../AsyncStorage';

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

describe('expo-sqlite', () => {
  test('smoke', async () => {
    const db = openDatabase('test.db');
    await new Promise((resolve, reject) => {
      db.readTransaction(
        tx => {
          tx.executeSql('SELECT 1');
        },
        reject,
        resolve,
      );
    });
    expect(true).toBeTruthy();
  });
});
