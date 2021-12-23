// @flow strict-local
import { openDatabase } from 'expo-sqlite';
// $FlowFixMe[untyped-import]
import sqlite3 from 'sqlite3';

import { SQLDatabase } from '../sqlite';

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

  test('transaction with no internal await', async () => {
    const db = openDatabase('test2.db');
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
    const db = openDatabase('test3.db');
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

describe('our promisified sqlite', () => {
  test('smoke', async () => {
    const db = new SQLDatabase('test4.db');
    const rows = await db.query<{ n: number }>('SELECT 42 AS n', []);
    expect(rows).toEqual([{ n: 42 }]);
  });

  test('transaction with no internal await', async () => {
    const db = new SQLDatabase('test5.db');
    await db.transaction(tx => {
      tx.executeSql('CREATE TABLE foo (x INT)');
      tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1]);
      tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2]);
    });
    const rows = await db.query<{ x: number }>('SELECT x FROM foo', []);
    expect(rows).toEqual([{ x: 1 }, { x: 2 }]);
  });

  test('transaction with internal await', async () => {
    const db = new SQLDatabase('test6.db');
    await db.transaction(async tx => {
      tx.executeSql('CREATE TABLE foo (x INT)');
      await tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1]);
      tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2]);
    });
    const rows = await db.query<{ x: number }>('SELECT x FROM foo', []);
    expect(rows).toEqual([{ x: 1 }, { x: 2 }]);
  });
});
