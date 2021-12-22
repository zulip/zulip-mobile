// @flow strict-local

import sqlite3 from 'sqlite3';
// $FlowFixMe[missing-export] -- present in test version of module
import { openDatabase, deleteDatabase } from 'expo-sqlite';

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
  const dbName = 'test.db';

  beforeAll(async () => {
    await deleteDatabase(dbName);
  });

  afterEach(async () => {
    await deleteDatabase(dbName);
  });

  test('smoke', async () => {
    const db = openDatabase(dbName);
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

  test('transaction with no internal await', async () => {
    const db = openDatabase(dbName);
    await new Promise((resolve, reject) =>
      db.transaction(
        tx => {
          tx.executeSql('CREATE TABLE foo (x INT)');
          tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1]);
          tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2]);
        },
        reject,
        resolve,
      ),
    );
    const result = await new Promise((resolve, reject) => {
      db.readTransaction(
        tx => {
          tx.executeSql('SELECT x FROM foo', [], (t, r) => resolve(r));
        },
        reject,
        resolve,
      );
    });
    expect(result.rows._array).toEqual([{ x: 1 }, { x: 2 }]);
  });

  test('transaction with internal await^W callback ', async () => {
    const db = openDatabase(dbName);
    await new Promise((resolve, reject) =>
      db.transaction(
        tx => {
          tx.executeSql('CREATE TABLE foo (x INT)');
          tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1], () =>
            tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2]),
          );
        },
        reject,
        resolve,
      ),
    );
    const result = await new Promise((resolve, reject) => {
      db.readTransaction(
        tx => {
          tx.executeSql('SELECT x FROM foo', [], (t, r) => resolve(r));
        },
        reject,
        resolve,
      );
    });
    expect(result.rows._array).toEqual([{ x: 1 }, { x: 2 }]);
  });
});
