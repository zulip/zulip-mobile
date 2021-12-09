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

/* eslint-disable-next-line flowtype/type-id-match */
type SQLArgument = number | string;

export class SQLDatabase {
  db: WebSQLDatabase;

  constructor(name: string) {
    this.db = openDatabase(name);
  }

  transaction(cb: SQLTransaction => void | Promise<void>): Promise<void> {
    return new Promise((resolve, reject) =>
      this.db.transaction(tx => void cb(new SQLTransaction(this, tx)), reject, resolve),
    );
  }

  readTransaction(cb: SQLTransaction => void | Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.readTransaction(
        tx => {
          cb(new SQLTransaction(this, tx));
        },
        reject,
        resolve,
      );
    });
  }

  /**
   * Convenience method for a single read-only query.
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

class SQLTransaction {
  db: SQLDatabase;
  tx: WebSQLTransaction;

  constructor(db: SQLDatabase, tx: WebSQLTransaction) {
    this.db = db;
    this.tx = tx;
  }

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
