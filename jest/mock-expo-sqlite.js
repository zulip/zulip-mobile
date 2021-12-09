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
  type WebSQLDatabase,
} from 'expo-sqlite';
import customOpenDatabase from '@expo/websql/custom';
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
    void this._exec(queries, callback);
  }

  async _exec(queries, callback) {
    if (this._closed) {
      throw new Error('already closed');
    }

    const results = [];
    let error = undefined;
    console.log('exec queries:', queries);
    for (const query of queries) {
      const { sql, args } = query;
      await new Promise((resolve, reject) => {
        this._db.all(sql, ...args, (err, rows) => {
          if (err) {
            error = err;
          } else {
            results.push(rows);
          }

          resolve();
        });
      });
      if (error) {
        break;
      }
    }

    if (error) {
      callback(error);
    } else {
      console.log('exec results:', results);
      // TODO rowsAffected?
      const endResults = results.map(r => ({ rowsAffected: null, rows: r }));
      callback(null, endResults);
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
  const db = customOpenDatabase(SQLiteDatabase)(name, version, description, size, callback);
  db._db = new SQLiteDatabase(name);
  return db;
}
