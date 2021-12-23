// @flow strict-local

// $FlowFixMe[missing-export] -- present in test version of module
import { openDatabase, deleteDatabase, type SQLResultSet } from 'expo-sqlite';
import invariant from 'invariant';
// $FlowFixMe[untyped-import]
import sqlite3 from 'sqlite3';

import { objectFromEntries } from '../../jsBackport';
import { SQLDatabase } from '../sqlite';
import { sleep } from '../../utils/async';

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
    let txEnded = false;
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
              txEnded = true;
            });
          });
        },
        reject,
        resolve,
      ),
    );

    // Let that asynchronous computation complete, and confirm the callback
    // completes without an exception.
    jest.runAllTimers();
    while (!txEnded) {
      await null;
    }

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

  test('transaction with internal asynchrony other than executeSql', async () => {
    // This corresponds to the similar test for expo-sqlite above, and
    // shows that we've successfully worked around that issue.

    let p1 = undefined;
    let p2 = undefined;

    const db = new SQLDatabase(dbName);
    const txPromise = db.transaction(async tx => {
      tx.executeSql('CREATE TABLE foo (name TEXT, value INT)');
      p1 = tx.executeSql('SELECT 2 + 2 AS total');
      const result = await p1;
      const { total } = result.rows._array[0];

      // Use that data to compute something synchronously, and store it.
      const double = 2 * total;
      tx.executeSql('INSERT INTO foo (name, value) VALUES (?, ?)', ['double', double]);

      // Now do some *asynchronous* computation, using the data we
      // read earlier in the transaction.  We'll use the exact same function as above:
      const asyncSquare = (x, cb) => setTimeout(() => cb(x * x), 0);
      p2 = new Promise(resolve => asyncSquare(total, resolve));
      const square = await p2;
      tx.executeSql('INSERT INTO foo (name, value) VALUES (?, ?)', ['square', square]);
    });

    // Let that asynchronous computation complete.  This gets a bit ugly: we
    // need to tell Jest to run the timer embedded inside that async
    // computation, and that does no good until the timer has been created,
    // so we end up having to walk through the async flow step by step.
    // prettier-ignore
    while (!p1) { await null; }
    await p1;
    // prettier-ignore
    while (!p2) { await null; }
    jest.runAllTimers();

    await txPromise;

    const rows = await db.query<{ name: string, value: number }>('SELECT name, value FROM foo', []);
    const data = objectFromEntries(rows.map(({ name, value }) => [name, value]));

    expect(data).toEqual({ double: 8, square: 16 });
  });
});
