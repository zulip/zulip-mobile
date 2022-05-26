/* @flow strict-local */
import LegacyAsyncStorage from '@react-native-async-storage/async-storage';

import invariant from 'invariant';
import { SQLDatabase } from './sqlite';
import * as logging from '../utils/logging';

// A better name for this class might be simply AsyncStorage.
// But for now we reserve that name for the thing that's a (nearly) drop-in
// replacement for the upstream AsyncStorage, which isn't this class itself
// but rather an instance of it.
export class AsyncStorageImpl {
  // This is a Promise rather than directly a SQLDatabase because... well,
  // anything that wants to consume it needs to be prepared to wait in any
  // case, so will be calling something like `_db()` that returns a Promise.
  // And then that might as well return the same Promise every time, rather
  // than unwrapping it up front and wrapping it in a new Promise on each call.
  dbSingleton: void | Promise<SQLDatabase> = undefined;

  version: number = 1; // Hard-coded for now, with just the migration from legacy AsyncStorage.

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

      // We'll use this to record successful migrations, such as from legacy
      // AsyncStorage.
      // There should only be one row.
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS migration (
          version INTEGER NOT NULL
        )
      `);
    });

    await this._migrate(db);

    return db;
  }

  async _migrate(db) {
    const version = (await db.query('SELECT version FROM migration LIMIT 1'))[0]?.version ?? 0;
    if (version === this.version) {
      return;
    }

    if (version > this.version) {
      logging.error('AsyncStorage: schema is from future', {
        targetVersion: this.version,
        storedVersion: version,
      });
      throw new Error('AsyncStorage: schema is from future');
    }

    invariant(this.version === 1, 'AsyncStorage._migrate currently assumes target version 1');
    if (version !== 0) {
      logging.error('AsyncStorage: no migration path', {
        storedVersion: version,
        targetVersion: this.version,
      });
      throw new Error('AsyncStorage: no migration path');
    }

    // Perform the migration.  For now, we're hardcoding that the only
    // migration is from version 0 to version 1.
    await db.transaction(async tx => {
      await this._migrateFromLegacyAsyncStorage(tx);

      tx.executeSql('DELETE FROM migration');
      tx.executeSql('INSERT INTO migration (version) VALUES (?)', [this.version]);
    });
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
  async _migrateFromLegacyAsyncStorage(tx) {
    // TODO: It would be nice to reduce the LegacyAsyncStorage dependency to
    //   be read-only -- in particular, for new installs to stop creating an
    //   empty legacy store, which on Android happens just from initializing
    //   the legacy AsyncStorage module.  This will basically mean vendoring
    //   the library into src/third-party/, and then stripping out
    //   everything not needed for read-only use.

    const keys = await LegacyAsyncStorage.getAllKeys();
    const values = await Promise.all(keys.map(key => LegacyAsyncStorage.getItem(key)));
    tx.executeSql('DELETE FROM keyvalue');
    for (let i = 0; i < keys.length; i++) {
      const value = values[i];
      if (value == null) {
        // TODO warn
        continue;
      }
      tx.executeSql('INSERT INTO keyvalue (key, value) VALUES (?, ?)', [keys[i], value]);
    }

    // TODO: After this migration has been out for a while and things seem fine,
    //   add another to delete the legacy storage.
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

  /**
   * Forget the AsyncStorage implementation's internal, non-persistent state.
   *
   * This should only be used in tests.  It has an effect similar to exiting
   * the program (but leaving the persistent storage intact), so that the
   * next use of AsyncStorage will behave as if freshly starting up the
   * program.
   */
  async devForgetState(): Promise<void> {
    this.dbSingleton = undefined;
  }
}

/**
 * A sound, nearly-drop-in replacement for RN's AsyncStorage.
 *
 * The methods should be invoked as methods, like `AsyncStorage.foo()`.
 *
 * Under that convention, and for the methods it has, this is a perfectly
 * drop-in replacement for the upstream AsyncStorage, meaning that it will
 * always satisfy the spec for how the upstream AsyncStorage behaves.
 *
 * The difference is that it also satisfies a tighter spec: each operation
 * either happens completely or not at all.  No operation corrupts the
 * database or has only partial effect, even if the process is killed or
 * encounters I/O errors.
 *
 * This is accomplished by using SQLite, and doing each operation in a
 * transaction.  The upstream AsyncStorage does the same thing on Android;
 * but on iOS, it uses an ad-hoc database which is susceptible to complete
 * corruption if interrupted.
 *
 * (If one pokes around other than by invoking the methods as methods, this
 * implementation has incidental other differences: these are real methods
 * that come from a prototype and use `this`, while the upstream
 * AsyncStorage is a plain object with functions as its own properties.)
 */
export const AsyncStorage: AsyncStorageImpl = new AsyncStorageImpl();
