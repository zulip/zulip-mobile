// @flow strict-local
//
// TODO: this should probably go to expo-sqlite upstream.
//
// Not really so much a "mock" as a fourth platform-specific implementation:
// this one for Node (and therefore for Jest), complementing upstream's for
// Android, iOS, and web.
//
// OK, well, it's a mock in one respect: the databases are all in-memory.

import type { Query, SQLiteCallback, WebSQLDatabase } from 'expo-sqlite';

// We import this dependency of expo-sqlite directly, because we're
// substituting for the expo-sqlite implementation that uses it.  (In a
// future where expo-sqlite no longer used this dependency, we'd want to
// make a similar change here, not keep using it.)
/* eslint-disable import/no-extraneous-dependencies */
// $FlowFixMe[untyped-import]
import customOpenDatabase from '@expo/websql/custom';

// $FlowFixMe[untyped-import]
import sqlite3 from 'sqlite3';

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-void */

const dbs = new Map();

function openDb(name: string) {
  const db = dbs.get(name);
  if (db != null) {
    return db;
  }

  const newDb = new sqlite3.Database(':memory:');
  dbs.set(name, newDb);
  return newDb;
}

class SQLiteDatabase {
  _db: $FlowFixMe;
  _closed: boolean = false;

  constructor(name: string) {
    this._db = openDb(name);
  }

  exec(queries: Query[], readOnly: boolean, callback: SQLiteCallback): void {
    if (this._closed) {
      throw new Error('already closed');
    }

    console.log('exec', queries);
    void this._exec(queries, callback);
  }

  async _exec(queries, callback) {
    try {
      const results = [];
      for (const { sql, args } of queries) {
        /* eslint-disable no-shadow */
        const rows = await new Promise((resolve, reject) =>
          this._db.all(sql, ...args, (err, rows) => (err ? reject(err) : resolve(rows))),
        );

        // TODO get rowsAffected and insertId.  This will mean calling
        //   `this._db.run` instead of `this._db.all`:
        //     https://github.com/mapbox/node-sqlite3/wiki/API#databaserunsql-param--callback
        //   which on the other hand will mean it doesn't return rows.
        //
        //   The way the Android implementation makes the equivalent choice
        //   is by checking if the statement looks like a SELECT.
        //   The iOS implementation uses the SQLite C API, and ends up looking
        //   more sensible.
        //   Given what node-sqlite3 gives us, our best strategy is probably
        //   the one in the Android implementation.
        results.push({ rowsAffected: 0, rows });
      }

      callback(null, results);
    } catch (e) {
      callback(e);
    }
  }

  close() {
    this._closed = true;
    this._db.close();
  }
}

/** Not found in expo-sqlite itself, but helpful for tests. */
export function deleteDatabase(name: string) {
  const db = dbs.get(name);
  if (!db) {
    return;
  }
  db.close();
  dbs.delete(name);
}

export function openDatabase(
  name: string,
  version?: string,
  description?: string,
  size?: number,
  callback?: (db: WebSQLDatabase) => void,
): WebSQLDatabase {
  const db = customOpenDatabase(SQLiteDatabase)(name, version, description, size, callback);
  db._db = new SQLiteDatabase(name);
  return db;
}
