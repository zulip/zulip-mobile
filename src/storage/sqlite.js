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
   * Note that the callback Promise is not treated in all the ways one would
   * hope for from a Promise-based API:
   *  * If the callback throws, the transaction gets committed (!) and the
   *    Promise returned by `transaction` still resolves, unless one of the
   *    SQL queries itself hits an error.
   *  * If the callback returns a Promise, nothing awaits it.  Any queries
   *    made after an `await` may be silently ignored.  If the Promise
   *    ultimately rejects, the rejection goes unhandled.
   *
   * We'll fix those in the near future.
   */
  transaction(cb: SQLTransaction => void | Promise<void>): Promise<void> {
    return new Promise((resolve, reject) =>
      this.db.transaction(tx => void cb(new SQLTransactionImpl(this, tx)), reject, resolve),
    );
  }

  /**
   * Like the `readTransaction` method in expo-sqlite, but promisified.
   *
   * Note that the callback Promise is not treated in all the ways one would
   * hope for from a Promise-based API:
   *  * If the callback throws, the Promise returned by `readTransaction`
   *    still resolves, unless one of the SQL queries itself hits an error.
   *  * If the callback returns a Promise, nothing awaits it.  Any queries
   *    made after an `await` may be silently ignored.  If the Promise
   *    ultimately rejects, the rejection goes unhandled.
   *
   * We'll fix those in the near future.
   */
  readTransaction(cb: SQLTransaction => void | Promise<void>): Promise<void> {
    return new Promise((resolve, reject) =>
      this.db.readTransaction(tx => void cb(new SQLTransactionImpl(this, tx)), reject, resolve),
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

class SQLTransactionImpl {
  db: SQLDatabase;
  tx: WebSQLTransaction;

  constructor(db: SQLDatabase, tx: WebSQLTransaction) {
    this.db = db;
    this.tx = tx;
  }

  /**
   * Like the `executeSql` method in expo-sqlite, but promisified.
   *
   * Note that limitations of the `transaction` and `readTransaction`
   * methods on `SQLDatabase` mean that you do not want to `await` the
   * result of this method, or indeed anything else, within the callbacks
   * passed to those methods.
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
