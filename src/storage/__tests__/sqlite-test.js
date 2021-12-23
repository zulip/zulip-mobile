// @flow strict-local

import sqlite3 from 'sqlite3';
// $FlowFixMe[missing-export] -- present in test version of module
import { openDatabase, deleteDatabase, type SQLResultSet } from 'expo-sqlite';
/* eslint-disable import/no-extraneous-dependencies */
// $FlowFixMe[untyped-import]: actually comes from our mock-immediate.js
import * as immediate from 'immediate';
import invariant from 'invariant';

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

  // These helpers `promiseTxn`, `promiseRead`, and `select` are convenient
  // for stitching the database control flow into the control flow of a
  // test.  They're similar to parts of our promisified wrapper...
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
    // (In our promisifying wrapper, we work around this issue; see
    // `keepQueueLiveWhile` in our sqlite.js, and the "with internal await"
    // tests below.)

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

  describe('transactions failing in app code', () => {
    beforeAll(() => immediate.allowUnhandled());
    afterAll(() => immediate.disallowUnhandled());
    afterEach(() => expect(immediate.takeUnhandled()).toEqual([]));

    // TODO Here's a Jest gotcha.  Try to report it?
    //   Say you have `foo: () => Promise<{ foo: number }[]>`.
    //   You write `expect(foo()).toEqual([{ foo: 3 }])`.
    //
    //   This is buggy -- should say `await foo()`, or `.resolves.toEqual(…)`.
    //   But you don't notice that; maybe you've forgotten `foo` returns a Promise.
    //
    //   Jest reports an error.  But the gotcha is: it just says
    //         Expected: [{"foo": 3}]
    //         Received: {}
    //   That is, the thing received is represented as `{}`.  It looks like
    //   a plain object.  There's no hint that it's actually a Promise.
    //   That's pretty misleading for debugging.

    test('BROKEN: throws early', async () => {
      // Do a bit of boring setup.
      const db = openDatabase(dbName);
      await promiseTxn(db, tx => {
        tx.executeSql('CREATE TABLE foo (x INT)');
        tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1]);
      });
      expect(await select(db, 'SELECT x FROM foo')).toEqual([{ x: 1 }]);
      expect(immediate.takeUnhandled()).toEqual([]);

      // Now attempt a transaction, and hit an exception in the transaction
      // callback.
      await promiseTxn(db, tx => {
        tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2]);
        throw new Error('Fiddlesticks!');
      });
      // This goes unnoticed by the expo-sqlite implementation, propagating
      // unhandled up to an `immediate` callback.  (So e.g. with a
      // Promise-based `immediate` implementation, it'd be an unhandled
      // Promise rejection.)
      expect(immediate.takeUnhandled()).toMatchObject([new Error('Fiddlesticks!')]);

      // In itself, that's only a code smell, not a live bug.  But, as usual
      // for unhandled Promise rejections, it does result in a live bug --
      // or in any case in user-visible effects that don't seem desirable.

      // A good behavior for that failed transaction to have would be:
      //   expect(await select(db, 'SELECT x FROM foo')).toEqual([{ x: 1 }]); // FAILS
      // i.e.: the transaction got rolled back, and we move on.

      // The actual behavior is:
      expect(await select(db, 'SELECT x FROM foo')).toEqual([{ x: 1 }, { x: 2 }]); // BAD
      // The transaction committed!

      // And indeed, we can carry on with more transactions as if all's well.
      await promiseTxn(db, tx => {
        tx.executeSql('INSERT INTO foo (x) VALUES (?)', [3]);
      });
      expect(await select(db, 'SELECT x FROM foo')).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }]); // BAD
    });

    // This describes desired behavior that's currently broken.
    test.skip('BROKEN: throws later -> cleanly rolls back and errors', async () => {
      const db = openDatabase(dbName);
      await promiseTxn(db, tx => {
        tx.executeSql('CREATE TABLE foo (x INT)');
        tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1]);
      });
      expect(await select(db, 'SELECT x FROM foo')).toEqual([{ x: 1 }]);

      // This time, throw in a query callback.
      // The transaction's error callback gets called (so promiseTxn rejects)…
      await expect(
        promiseTxn(db, tx => {
          tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2], (err, r) => {
            tx.executeSql('INSERT INTO foo (x) VALUES (?)', [3]);
            throw new Error('Fiddlesticks!');
          });
        }),
      ).rejects.toThrowError('Fiddlesticks!');

      // … and the whole transaction gets rolled back.
      expect(await select(db, 'SELECT x FROM foo')).toEqual([{ x: 1 }]);

      // Subsequent queries work fine.
      await promiseTxn(db, tx => {
        tx.executeSql('INSERT INTO foo (x) VALUES (?)', [4]);
      });
      expect(await select(db, 'SELECT x FROM foo')).toEqual([{ x: 1 }, { x: 4 }]);
    });

    test('BROKEN: throws later -> actual, broken behavior', async () => {
      const db = openDatabase(dbName);
      await promiseTxn(db, tx => {
        tx.executeSql('CREATE TABLE foo (x INT)');
        tx.executeSql('INSERT INTO foo (x) VALUES (?)', [1]);
      });
      expect(await select(db, 'SELECT x FROM foo')).toEqual([{ x: 1 }]);

      // $FlowFixMe[prop-missing]
      db._db.allowUnhandled();

      let _ops = undefined;
      const p1 = new Promise((resolve, reject) => (_ops = { resolve, reject }));
      invariant(_ops, 'ops should be initialized');
      const ops = _ops;

      // The overall transaction reports no error; neither its success nor
      // failure callback ever gets called.
      // eslint-disable-next-line no-unused-vars
      const p = promiseTxn(db, tx => {
        tx.executeSql('INSERT INTO foo (x) VALUES (?)', [2], (err, r) => {
          tx.executeSql('INSERT INTO foo (x) VALUES (?)', [3]);
          ops.resolve();
          throw new Error('Fiddlesticks!');
        });
      });
      // Instead... well, in the actual expo-sqlite implementation, there's
      // an unhandled Promise rejection, as the `then` callback in the
      // definition of `exec` in `SQLite.ts` throws.  In our mock
      // implementation, we selectively let that slide with `allowUnhandled`.

      // Because expo-sqlite never calls the transaction callbacks, we need
      // our own mechanism to await everything being settled.
      await p1;

      // This would just hang:
      //   await p;

      // Then: the `db` object gets left in a stuck state.  (Internally,
      // `this._running` on the `WebSQLDatabase` is stuck as true.)  So if
      // we try any query, even something read-only:
      //   expect(await select(db, 'SELECT x FROM foo')).toEqual([{ x: 1 }]);
      // it just never completes.

      // (There isn't an obvious good way to write a test *of* that
      // particular broken behavior, though.)
    });
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
