// @flow strict-local
import {
  openDatabase,
  type SQLResultSet,
  type WebSQLDatabase,
  type SQLTransaction as WebSQLTransaction,
} from 'expo-sqlite';
import invariant from 'invariant';

/* eslint-disable no-use-before-define */
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
    return new Promise((resolve, reject) =>
      this.db.readTransaction(tx => void cb(new SQLTransaction(this, tx)), reject, resolve),
    );
  }

  /** For a single read-only query. */
  async query(statement: string, args?: $ReadOnlyArray<SQLArgument>): Promise<SQLResultSet> {
    let p: void | Promise<SQLResultSet> = undefined;
    await this.readTransaction(tx => {
      p = tx.executeSql(statement, args);
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
