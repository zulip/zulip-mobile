/* @flow strict-local */
import { SQLDatabase } from './sqlite';

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

// TODO: This needs a migration strategy!  How do we move the user's data
//   from the old AsyncStorage to the new database?
//
//   On Android, we could bypass this by arranging to use the old thing's
//   database and table name.  Might need some tweaking of expo-sqlite in
//   order to control the database name fully enough.
//
//   But on iOS, it's not so simple.  Values over 1024 characters
//   (RCTInlineValueThreshold, in RNCAsyncStorage.m) are written as separate
//   files.  Values up to that threshold go into a single JSON blob (for the
//   whole key-value store) that's written as one file.  So really our
//   sanest path is probably to keep the legacy AsyncStorage as a dependency
//   indefinitely, and use it to read the old data if the new doesn't exist.
//
//   Then once we're doing that for iOS, might as well do it for Android
//   too, and not have to follow the old names.

// A better name for this class might be simply AsyncStorage.
// But for now we reserve that name for the thing that's a drop-in
// replacement for the upstream AsyncStorage, which isn't this class itself
// but rather an instance of it.
export class AsyncStorageImpl {
  // This is a Promise rather than directly a SQLDatabase because... well,
  // anything that wants to consume it needs to be prepared to wait in any
  // case, so will be calling something like `_db()` that returns a Promise.
  // And then that might as well return the same Promise every time, rather
  // than unwrapping it up front and wrapping it in a new Promise on each call.
  dbSingleton: void | Promise<SQLDatabase> = undefined;

  _db(): Promise<SQLDatabase> {
    if (this.dbSingleton) {
      return this.dbSingleton;
    }

    this.dbSingleton = this._initDb();
    return this.dbSingleton;
  }

  async _initDb() {
    const db = new SQLDatabase('zulip.db');
    await db.transaction(tx => {
      // This schema is just like the one in RN's AsyncStorage (see
      // ReactDatabaseSupplier.java), except for a small fix: the latter
      // doesn't mention NOT NULL on the `key` column.  In standard SQL
      // that'd be redundant with PRIMARY KEY (though c'mon, EIBTI)… but
      // SQLite has a quirk that PRIMARY KEY does *not* imply NOT NULL:
      //   https://www.sqlite.org/lang_createtable.html#the_primary_key
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS keyvalue (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        )
      `);
      // TODO consider adding STRICT to the schema; requires SQLite 3.37,
      //   from 2021-11: https://www.sqlite.org/stricttables.html
    });
    return db;
  }

  async getItem(key: string): Promise<string | null> {
    const db = await this._db();
    const rows = await db.query<{ value: string }>('SELECT value FROM keyvalue WHERE key = ?', [
      key,
    ]);
    return rows.length > 0 ? rows[0].value : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    const db = await this._db();
    return db.transaction(tx => {
      tx.executeSql('INSERT OR REPLACE INTO keyvalue (key, value) VALUES (?, ?)', [key, value]);
    });
  }

  async multiSet(keyValuePairs: Array<Array<string>>): Promise<void> {
    const db = await this._db();
    return db.transaction(tx => {
      for (const kv of keyValuePairs) {
        tx.executeSql('INSERT OR REPLACE INTO keyvalue (key, value) VALUES (?, ?)', kv);
      }
    });
  }

  async removeItem(key: string): Promise<void> {
    const db = await this._db();
    return db.transaction(tx => {
      tx.executeSql('DELETE FROM keyvalue WHERE key = ?', [key]);
    });
  }

  async getAllKeys(): Promise<string[]> {
    const db = await this._db();
    const rows = await db.query<{ key: string }>('SELECT key FROM keyvalue');
    return rows.map(r => r.key);
  }

  async clear(): Promise<void> {
    const db = await this._db();
    return db.transaction(tx => {
      tx.executeSql('DELETE FROM keyvalue');
    });
  }
}

// Drop-in replacement for (certain methods of) RN's AsyncStorage.
export const AsyncStorage: AsyncStorageImpl = new AsyncStorageImpl();
