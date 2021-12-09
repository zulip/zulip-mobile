// @flow strict-local
//
// Not really so much a "mock" as a fourth platform-specific implementation:
// this one for Node (and therefore for Jest), complementing upstream's for
// Android, iOS, and web.

import {
  type Query,
  type ResultSet,
  type ResultSetError,
  type SQLiteCallback,
  openDatabase as openDatabaseInner,
  type WebSQLDatabase,
} from 'expo-sqlite';
import sqlite3 from 'sqlite3';

/*
// TODO expo-sqlite munges queries, sometimes, when Platform.OS android
export async function exec(
  name: string,
  queries: string[],
  readOnly: boolean,
): Promise<(ResultSetError | ResultSet)[]> {
  console.log('exec 0');
  const db = await openDb(name);
  console.log('exec');
  console.log('queries', queries.length, typeof queries[0], queries[0].length, queries[0][0]);
  return Promise.all(
    queries.map(query => {
      const [sql, args] = query;
      //   console.log('query:', query);
      return new Promise((resolve, reject) => {
        // TODO adapt rows
        db.all(sql, ...args, (err, rows) =>
          err ? reject(err) : resolve([null, undefined, undefined, undefined, rows]),
        );
      });
    }),
  );
}

// TODO close
*/

/* eslint-disable no-underscore-dangle */

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

    const results = [];
    for (const query of queries) {
      const { sql, args } = query;
      db.all(sql, ...args, (err, rows) => {
        if (err) {
          // TODO ??
          callback(err);
          return;
        }

        // TODO WORK HERE
        callback(null);
      });
    }
  }

  close() {
    this._closed = true;
    this._db.close();
  }
}

export function openDatabase(
  name: string,
  version?: string,
  description?: string,
  size?: number,
  callback?: (db: WebSQLDatabase) => void,
): WebSQLDatabase {
  const db = openDatabaseInner(name, version, description, size, callback);
  db._db;
  return db;
}
