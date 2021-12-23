// @flow strict-local
import {
  openDatabase,
  type SQLResultSet,
  type WebSQLDatabase,
  type SQLTransaction as WebSQLTransaction,
} from 'expo-sqlite';
import invariant from 'invariant';

/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */
/* eslint-disable flowtype/type-id-match */

type SQLArgument = number | string;

/**
 * A Promise-based wrapper on expo-sqlite.
 *
 * Note the important limitations of the current promisification, described
 * on `transaction` and `readTransaction`.
 */
export class SQLDatabase {
  db: WebSQLDatabase;

  constructor(name: string) {
    this.db = openDatabase(name);
  }

  /**
   * Like the `transaction` method in expo-sqlite, but promisified.
   *
   * The transaction will stay open as long as the Promise the callback
   * returned stays unsettled.  That means the callback can use `await` as
   * usual.
   *
   * For performance reasons, though, avoid using `await` other than on
   * `executeSql` results or already-settled values.  In particular, avoid
   * awaiting network requests or other things that take time but don't need
   * to occupy the CPU.  That's because the current implementation of this
   * method effectively busy-waits, by making trivial SQL queries, when SQL
   * queries are getting to run but the transaction has no other SQL queries
   * outstanding.
   *
   * Note that the callback Promise is not treated in all the ways one would
   * hope for from a Promise-based API:
   *  * If the callback throws, the transaction gets committed (!) and the
   *    Promise returned by `transaction` still resolves, unless one of the
   *    SQL queries itself hits an error.
   *  * If the callback returns a Promise that ultimately rejects, the same
   *    thing applies, and the rejection goes unhandled.
   *
   * We'll fix those in the near future.
   */
  // TODO: It'd be good to be able to remove the performance warning above.
  //   (Well, part of it; having a transaction block on something
  //   potentially really slow like a network request will generally be a
  //   bad idea just because of blocking other things in the app from
  //   proceeding, even if it doesn't involve busy-waiting.)
  //
  //   This will involve modifying expo-sqlite, replacing much of the
  //   node-websql code under it.
  //
  //   More background on that performance warning:
  //     https://github.com/zulip/zulip-mobile/pull/5184#discussion_r779300110
  transaction(cb: SQLTransaction => void | Promise<void>): Promise<void> {
    return new Promise((resolve, reject) =>
      this.db.transaction(
        tx => void keepQueueLiveWhile(tx, () => cb(new SQLTransactionImpl(this, tx))),
        reject,
        resolve,
      ),
    );
  }

  /**
   * Like the `readTransaction` method in expo-sqlite, but promisified.
   *
   * See `transaction` for performance considerations on how to use `await`
   * inside the callback.
   *
   * Note that the callback Promise is not treated in all the ways one would
   * hope for from a Promise-based API:
   *  * If the callback throws, the Promise returned by `readTransaction`
   *    still resolves, unless one of the SQL queries itself hits an error.
   *  * If the callback returns a Promise that ultimately rejects, the same
   *    thing applies, and the rejection goes unhandled.
   *
   * We'll fix those in the near future.
   */
  readTransaction(cb: SQLTransaction => void | Promise<void>): Promise<void> {
    return new Promise((resolve, reject) =>
      this.db.readTransaction(
        tx => void keepQueueLiveWhile(tx, () => cb(new SQLTransactionImpl(this, tx))),
        reject,
        resolve,
      ),
    );
  }

  /**
   * Convenience method for a single read-only query.
   *
   * This uses `readTransaction` to do its work, so it will be serialized
   * relative to any transactions made with `transaction`.
   *
   * Warning: nothing checks that the returned rows actually match the given
   * Row type.  The actual rows will be objects keyed on the column names in
   * the query.  For effective type-checking, always pass a type parameter
   * that matches the query.  For example:
   *   db.query<{ foo: number, bar: string }>('SELECT foo, bar FROM stuff');
   */
  async query<Row: { ... } = { ... }>(
    statement: string,
    args?: $ReadOnlyArray<SQLArgument>,
  ): Promise<Row[]> {
    let p: void | Promise<Row[]> = undefined;
    await this.readTransaction(tx => {
      p = tx.executeSql(statement, args).then(r => r.rows._array);
    });
    invariant(p, 'transaction finished; statement promise should be initialized');
    return p;
  }
}

// An absurd little workaround for expo-sqlite, or really the @expo/websql /
// node-websql library under it, being too eager to check a transaction's
// queue and declare it complete.
async function keepQueueLiveWhile(
  tx: WebSQLTransaction,
  f: () => void | Promise<void>,
): Promise<void> {
  let done = false;

  // To prevent a commit before the transaction is actually ready for it, we
  // keep a trivial statement in the queue until we're done.  It goes in
  // before we make our first `await`, and every time the queue reaches it
  // we synchronously put a new such statement in the queue, until the end.
  const hold = () => tx.executeSql('SELECT 1', [], () => (done ? undefined : hold()));
  hold();

  try {
    await f();
  } finally {
    done = true;
  }
}

class SQLTransactionImpl {
  db: SQLDatabase;
  tx: WebSQLTransaction;

  constructor(db: SQLDatabase, tx: WebSQLTransaction) {
    this.db = db;
    this.tx = tx;
  }

  /**
   * Like the `executeSql` method in expo-sqlite, but promisified.
   */
  executeSql(statement: string, args?: $ReadOnlyArray<SQLArgument>): Promise<SQLResultSet> {
    return new Promise((resolve, reject) => {
      this.tx.executeSql(
        statement,
        args,
        (t, r) => resolve(r),
        (t, e) => {
          reject(e);
          return true; // true means propagate the error and roll back the transaction
        },
      );
    });
  }
}

export type SQLTransaction = SQLTransactionImpl;
