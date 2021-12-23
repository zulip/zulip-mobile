// @flow strict-local

// $FlowFixMe[missing-export] -- present in test version of module
import { openDatabase, deleteDatabase, type SQLResultSet } from 'expo-sqlite';
import invariant from 'invariant';
// $FlowFixMe[untyped-import]
import sqlite3 from 'sqlite3';

import { objectFromEntries } from '../../jsBackport';
import { SQLDatabase } from '../sqlite';

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
    // (In our promisifying wrapper, we work around this issue; see
    // `keepQueueLiveWhile` in our sqlite.js, and the "with internal await"
    // tests below.)

    const db = openDatabase(dbName);

    // This sets up a promise we'll use purely as part of the test harness,
    // to confirm the control flow reached the end of our callback chain.
    let txEndResolve_ = undefined;
    const txEnd = new Promise(resolve => (txEndResolve_ = resolve));
    invariant(txEndResolve_, 'Promise constructor callback should have run');
    const txEndResolve = txEndResolve_;

    await new Promise((resolve, reject) =>
      db.transaction(
        tx => {
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
              txEndResolve('reached the end');
            });
          });
        },
        reject,
        resolve,
      ),
    );

    // Let that asynchronous computation complete, and confirm the callback
    // completed without an exception.
    jest.runOnlyPendingTimers();
    expect(jest.getTimerCount()).toBe(0);
    expect(await txEnd).toEqual('reached the end');

    // Now read what data got written.
    const result = await new Promise((resolve, reject) => {
      db.readTransaction(
        tx => tx.executeSql('SELECT name, value FROM foo', [], (t, r) => resolve(r)),
        reject,
        resolve,
      );
    });
    const data = objectFromEntries(result.rows._array.map(({ name, value }) => [name, value]));

    // This would be a good answer:
    // expect(data).toEqual({ double: 8, square: 16 }); // FAILS

    // Instead, we get:
    expect(data).toEqual({ double: 8 }); // bad: missing the second INSERT
  });
});

describe('our promisified sqlite', () => {
  const dbName = 'test.db';

  beforeAll(async () => {
    await deleteDatabase(dbName);
  });

  afterEach(async () => {
    await deleteDatabase(dbName);
  });

  test('smoke', async () => {
    const db = new SQLDatabase(dbName);
    const rows = await db.query<{ n: number }>('SELECT 42 AS n', []);
    expect(rows).toEqual([{ n: 42 }]);
  });

  test('transaction with no internal await', async () => {
    const db = new SQLDatabase(dbName);
    await db.transaction(tx => {
      tx.executeSql('CREATE TABLE foo (x INT)');
      tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1]);
      tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2]);
    });
    const rows = await db.query<{ x: number }>('SELECT x FROM foo', []);
    expect(rows).toEqual([{ x: 1 }, { x: 2 }]);
  });

  test('transaction with internal await', async () => {
    const db = new SQLDatabase(dbName);
    await db.transaction(async tx => {
      tx.executeSql('CREATE TABLE foo (x INT)');
      await tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1]);
      tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2]);
    });
    const rows = await db.query<{ x: number }>('SELECT x FROM foo', []);
    expect(rows).toEqual([{ x: 1 }, { x: 2 }]);
  });

  test('read-transaction with no internal await', async () => {
    const db = new SQLDatabase(dbName);
    let a: SQLResultSet | void = undefined;
    let b: SQLResultSet | void = undefined;
    await db.readTransaction(async tx => {
      tx.executeSql('SELECT 1 AS n').then(r => (a = r));
      tx.executeSql('SELECT 2 AS n').then(r => (b = r));
    });
    expect(a?.rows._array).toEqual([{ n: 1 }]);
    expect(b?.rows._array).toEqual([{ n: 2 }]);
  });

  test('read-transaction with internal await', async () => {
    const db = new SQLDatabase(dbName);
    let a: SQLResultSet | void = undefined;
    let b: SQLResultSet | void = undefined;
    await db.readTransaction(async tx => {
      a = await tx.executeSql('SELECT 1 AS n');
      b = await tx.executeSql('SELECT 2 AS n');
    });
    expect(a?.rows._array).toEqual([{ n: 1 }]);
    expect(b?.rows._array).toEqual([{ n: 2 }]);
  });
});
