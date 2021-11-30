/* @flow strict-local */

import { REHYDRATE } from './constants';

export type Storage = {
  +multiSet: (keyValuePairs: Array<Array<string>>) => Promise<mixed>,
  +getItem: (key: string) => Promise<string | null>,
  +removeItem: string => Promise<mixed>,
  +getAllKeys: () => Promise<$ReadOnlyArray<string>>,
  ...
};

export type Config = {|
  +whitelist: string[],
  +storage: Storage,
  +serialize: mixed => string,
  +deserialize: string => mixed,
  +keyPrefix?: string,
|};

/**
 * The action dispatched to rehydrate the store.
 *
 * This type is "overpromised" in that the type given for the `payload`
 * property is impossibly specific -- it allows the code consuming one of
 * these actions to make absolutely any assumptions it likes about the
 * payload.  Put another way, this type makes all kinds of promises about
 * the payload.
 *
 * A more truthful type would be `payload: { ... }`.  It's an object with
 * whatever data was retrieved from storage, which in particular may be from
 * an old version of the app's schema.
 *
 * TODO find a cleaner way to express this type.  A tricky bit is that after
 *   the migration middleware operates, the rehydrate action that it passes
 *   through has a more-specific payload type than `{ ... }`: it should
 *   actually be (a partial version of) the current schema.  So that
 *   more-specific type is what we write down for our reducers to rely on.
 */
export type OverpromisedRehydrateAction = {|
  type: typeof REHYDRATE,
  payload: empty, // Not really `empty`, but see jsdoc above.
|};

export type Persistor = {
  purge: (keys?: $ReadOnlyArray<string>) => void | Promise<mixed>,
  pause: () => void,
  resume: () => void,

  /** Internal to redux-persist; don't call from elsewhere. */
  _resetLastWrittenState: () => void,

  ...
};
