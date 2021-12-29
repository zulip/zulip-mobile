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

  // These helpers `promiseTxn`, `promiseRead`, and `select` are convenient
  // for stitching the database control flow into the control flow of a
  // test.  They're similar to parts of our upcoming promisified wrapper...
  // namely the outermost, simplest parts.
  const promiseTxn = (db, cb) =>
    new Promise((resolve, reject) => db.transaction(cb, reject, resolve));

  const promiseRead = (db, cb) =>
    new Promise((resolve, reject) => db.readTransaction(cb(resolve), reject, resolve));

  const select = (db, sql, args = []) =>
    promiseRead(db, resolve => tx => tx.executeSql(sql, args, (t, r) => resolve(r))).then(
      r => r.rows._array,
    );

  test('smoke', async () => {
    const db = openDatabase(dbName);
    const rows = await select(db, 'SELECT 42 AS n');
    expect(rows).toEqual([{ n: 42 }]);
  });

  test('transaction with no internal await', async () => {
    const db = openDatabase(dbName);
    await promiseTxn(db, tx => {
      tx.executeSql('CREATE TABLE foo (x INT)');
      tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1]);
      tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2]);
    });
    const rows = await select(db, 'SELECT x FROM foo');
    expect(rows).toEqual([{ x: 1 }, { x: 2 }]);
  });

  test('transaction with internal await^W callback ', async () => {
    const db = openDatabase(dbName);
    await promiseTxn(db, tx => {
      tx.executeSql('CREATE TABLE foo (x INT)');
      tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1], () =>
        tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2]),
      );
    });
    const rows = await select(db, 'SELECT x FROM foo');
    expect(rows).toEqual([{ x: 1 }, { x: 2 }]);
  });
});
