/* @flow strict-local */
import LegacyAsyncStorage from '@react-native-async-storage/async-storage';

import { SQLDatabase } from './sqlite';

/* eslint-disable no-underscore-dangle */

// This is a Promise rather than directly a SQLDatabase because... well,
// anything that wants to consume it needs to be prepared to wait in any
// case, so will be calling something like `_db()` that returns a Promise.
// And then that might as well return the same Promise every time, rather
// than unwrapping it up front and wrapping it in a new Promise on each call.
let dbSingleton: void | Promise<SQLDatabase> = undefined;

// Drop-in replacement for RN's AsyncStorage.
export class AsyncStorage {
  static _db(): Promise<SQLDatabase> {
    if (dbSingleton) {
      return dbSingleton;
    }

    dbSingleton = AsyncStorage._initDb();
    return dbSingleton;
  }

  static async _initDb() {
    console.log('_initDb 1');
    const db = new SQLDatabase('zulip.db');
    console.log('_initDb 2');
    false
      && (await db.transaction(tx => {
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

        // We'll use this to record successfully migrating from legacy
        // AsyncStorage.
        tx.executeSql(`
        CREATE TABLE IF NOT EXISTS migrations (
          name TEXT PRIMARY KEY NOT NULL
        )
      `);
      }));

    // await AsyncStorage._migrateFromLegacyAsyncStorage(db);

    console.log('_initDb 3');
    return db;
  }

  // The migration strategy.  How do we move the user's data from the old
  // AsyncStorage to the new database?
  //
  // On Android, we could bypass this by arranging to use the old thing's
  // database and table name.  Might need some tweaking of expo-sqlite in
  // order to control the database name fully enough.
  //
  // But on iOS, it's not so simple.  Values over 1024 characters
  // (RCTInlineValueThreshold, in RNCAsyncStorage.m) are written as separate
  // files.  Values up to that threshold go into a single JSON blob (for the
  // whole key-value store) that's written as one file.  So rather than try
  // to duplicate that, we just keep the legacy AsyncStorage as a
  // dependency, and use it to read the old data if the new doesn't exist.
  //
  // Then once we're doing that for iOS, might as well do it for Android
  // too, and not have to follow the old names.
  static async _migrateFromLegacyAsyncStorage(db) {
    const migrated =
      (await db.query('SELECT 1 FROM migrations WHERE name = ?', ['legacy-asyncstorage'])).length
      > 0;
    if (migrated) {
      return;
    }

    // TODO: It would be nice to reduce the LegacyAsyncStorage dependency to
    //   be read-only -- in particular, for new installs to stop creating an
    //   empty legacy store, which on Android happens just from initializing
    //   the legacy AsyncStorage module.  This will basically mean vendoring
    //   the library into src/third-party/, and then stripping out
    //   everything not needed for read-only use.

    const keys = await LegacyAsyncStorage.getAllKeys();
    const values = await Promise.all(keys.map(key => LegacyAsyncStorage.getItem(key)));
    await db.transaction(tx => {
      tx.executeSql('DELETE FROM keyvalue');
      for (let i = 0; i < keys.length; i++) {
        const value = values[i];
        if (value == null) {
          // TODO warn
          continue;
        }
        tx.executeSql('INSERT INTO keyvalue (key, value) VALUES (?, ?)', [keys[i], value]);
      }
    });

    await db.transaction(tx => {
      tx.executeSql('INSERT INTO migrations (name) VALUES (?)', ['legacy-asyncstorage']);
    });

    // TODO: After this migration has been out for a while and things seem fine,
    //   add another to delete the legacy storage.
  }

  static async getItem(key: string): Promise<string | null> {
    console.log('getItem 1');
    const db = await AsyncStorage._db();
    console.log('getItem 2');
    const rows = await db.query<{ value: string }>('SELECT value FROM keyvalue WHERE key = ?', [
      key,
    ]);
    console.log('getItem 3');
    const row = rows[0];
    return row ? row.value : null;
  }

  static async setItem(key: string, value: string): Promise<void> {
    const db = await AsyncStorage._db();
    return db.transaction(tx => {
      tx.executeSql('INSERT OR REPLACE INTO keyvalue (key, value) VALUES (?, ?)', [key, value]);
    });
  }

  static async multiSet(keyValuePairs: Array<Array<string>>): Promise<void> {
    const db = await AsyncStorage._db();
    return db.transaction(tx => {
      for (const kv of keyValuePairs) {
        tx.executeSql('INSERT OR REPLACE INTO keyvalue (key, value) VALUES (?, ?)', kv);
      }
    });
  }

  static async removeItem(key: string): Promise<void> {
    const db = await AsyncStorage._db();
    return db.transaction(tx => {
      tx.executeSql('DELETE FROM keyvalue WHERE key = ?', [key]);
    });
  }

  static async getAllKeys(): Promise<string[]> {
    const db = await AsyncStorage._db();
    const rows = await db.query<{ key: string }>('SELECT key FROM keyvalue');
    return rows.map(r => r.key);
  }

  static async clear(): Promise<void> {
    const db = await AsyncStorage._db();
    return db.transaction(tx => {
      tx.executeSql('DELETE FROM keyvalue');
    });
  }
}
