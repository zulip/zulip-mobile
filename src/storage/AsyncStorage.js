/* @flow strict-local */
import LegacyAsyncStorage from '@react-native-async-storage/async-storage';

import invariant from 'invariant';
import { SQLDatabase, type SQLTransaction } from './sqlite';
import * as logging from '../utils/logging';

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

export class Migration {
  // This migrations API is inspired in part by AndroidX's Room library:
  //   https://developer.android.com/training/data-storage/room/migrating-db-versions#manual

  // Currently `startVersion + 1 === endVersion` always.
  // But we take both start and end versions for two reasons:
  //
  //  * It means the migrations are explicitly linked together, one to the
  //    next, in application code.  Helpful when merging concurrent feature
  //    branches, by ensuring the later one takes account of the earlier.
  //
  //  * It leaves this API open to later supporting shortcut migrations
  //    that squash together several individual upgrades (like room does.)
  startVersion: number;
  endVersion: number;
  migrate: SQLTransaction => Promise<void>;

  constructor(startVersion: number, endVersion: number, migrate: SQLTransaction => Promise<void>) {
    invariant(
      startVersion + 1 === endVersion,
      'AsyncStorage migration only supports incrementing version by 1',
    );
    this.startVersion = startVersion;
    this.endVersion = endVersion;
    this.migrate = migrate;
  }
}

export class BaseAsyncStorage {
  // This is a Promise rather than directly a SQLDatabase because... well,
  // anything that wants to consume it needs to be prepared to wait in any
  // case, so will be calling something like `_db()` that returns a Promise.
  // And then that might as well return the same Promise every time, rather
  // than unwrapping it up front and wrapping it in a new Promise on each call.
  dbSingleton: void | Promise<SQLDatabase> = undefined;

  version: number;
  migrations: $ReadOnlyArray<Migration>;

  constructor(version: number, migrations: $ReadOnlyArray<Migration>) {
    invariant(
      // $FlowIssue[unnecessary-optional-chain]: array can lack element
      version === (migrations[migrations.length - 1]?.endVersion ?? 0),
      'AsyncStorage: must have migration to target version',
    );
    invariant(
      // $FlowIssue[unnecessary-optional-chain]: array can lack element
      (migrations[0]?.startVersion ?? 0) === 0,
      'AsyncStorage: migrations must start from version 0',
    );
    this.version = version;
    this.migrations = migrations;
  }

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
    // This looks silly, but avoids a Flow soundness bug: if we say
    // `this.migrations` directly in the spot where we use it, its type
    // is `empty` and so there's no useful type-checking of how we
    // use each migration.
    // TODO(flow): Report that Flow issue upstream.
    const migrations = this.migrations;

    let version = (await db.query('SELECT version FROM migration LIMIT 1'))[0]?.version ?? 0;
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

    for (const migration of migrations) {
      // Yes, this is a linear scan.  But we'll be doing it at most once per
      // program run (and in fact at most once per migration.)  So building
      // a fancier data structure of the migrations wouldn't be useful,
      // because building that data structure would itself take at least
      // linear time.

      if (migration.startVersion < version) {
        continue;
      }
      if (migration.startVersion !== version) {
        logging.error('AsyncStorage: no migration path', {
          version,
          targetVersion: this.version,
        });
        throw new Error('AsyncStorage: no migration path');
      }

      // Perform the migration.
      await db.transaction(async tx => {
        await (migration: Migration).migrate(tx);

        tx.executeSql('DELETE FROM migration');
        tx.executeSql('INSERT INTO migration (version) VALUES (?)', [migration.endVersion]);
      });

      version = migration.endVersion;
    }

    invariant(
      version === this.version,
      'AsyncStorage: last migration should have reached target version',
    );
  }

  async getItem(key: string): Promise<string | null> {
    const db = await this._db();
    const rows = await db.query<{ value: string }>('SELECT value FROM keyvalue WHERE key = ?', [
      key,
    ]);
    const row = rows[0];
    return row ? row.value : null;
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

  /**
   * Like `clear` but also forget any migrations.
   *
   * This should only be used in tests.
   */
  async devWipe(): Promise<void> {
    const db = await this._db();
    await db.transaction(tx => {
      tx.executeSql('DELETE FROM keyvalue');
      tx.executeSql('DELETE FROM migration');
    });
    this.devForgetState();
  }
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
export const migrationFromLegacyAsyncStorage: Migration = new Migration(0, 1, async tx => {
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
});

// Drop-in replacement for RN's AsyncStorage.
export const AsyncStorage: BaseAsyncStorage = new BaseAsyncStorage(1, [
  migrationFromLegacyAsyncStorage,
]);
