// @flow strict-local

import sqlite3 from 'sqlite3';
// $FlowFixMe[missing-export] -- present in test version of module
import { openDatabase, deleteDatabase } from 'expo-sqlite';

import { objectFromEntries } from '../../jsBackport';

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-assign */

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

  test('BROKEN: transaction with internal asynchrony other than executeSql', async () => {
    // This test shows that if using expo-sqlite you try to make a
    // transaction that involves some asynchronous work between SQL queries,
    // the transaction gets committed in a half-done state.  Moreover
    // the subsequent statements get silently ignored, with no error.
    //
    // This failure mode gets triggered very easily if you try to use
    // Promises.  But if you actually have some asynchronous work to do,
    // then this hits even if you express the flow in pure callback terms.
    // So we'll demonstrate it that way here.
    //
    // (In our promisifying wrapper, we'll work around this issue.)

    const db = openDatabase(dbName);
    let txEnded = false;
    await promiseTxn(db, tx => {
      tx.executeSql('CREATE TABLE foo (name TEXT, value INT)');

      // Get some data from SQL.
      tx.executeSql('SELECT 2 + 2 AS total', [], (t, result) => {
        const { total } = result.rows._array[0];

        // Use that data to compute something synchronously, and store it.
        const double = 2 * total;
        tx.executeSql('INSERT INTO foo (name, value) VALUES (?, ?)', ['double', double]);
        // So far, all's well.

        // Now do some *asynchronous* computation, using the data we
        // read earlier in the transaction.
        const asyncSquare = (x, cb) => setTimeout(() => cb(x * x), 0);
        asyncSquare(total, square => {
          // By the time we get here, the transaction will have found its
          // queue empty and decided it's complete.

          // So when we try to write this result, nothing will happen.
          tx.executeSql('INSERT INTO foo (name, value) VALUES (?, ?)', ['square', square]);

          // The new statement goes into a queue which will never again
          // get read.  We don't even get an exception -- the next line
          // runs fine (as we confirm below):
          txEnded = true;
        });
      });
    });

    // Let that asynchronous computation complete, and confirm the callback
    // completes without an exception.
    jest.runAllTimers();
    while (!txEnded) {
      await null;
    }

    // Now read what data got written.
    const rows = await select(db, 'SELECT name, value FROM foo');
    const data = objectFromEntries(rows.map(({ name, value }) => [name, value]));

    // This would be a good answer:
    // expect(data).toEqual({ double: 8, square: 16 }); // FAILS

    // Instead, we get:
    expect(data).toEqual({ double: 8 }); // bad: missing the second INSERT
  });
});
