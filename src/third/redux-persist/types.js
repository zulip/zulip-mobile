/* @flow strict-local */

type Storage = {
  +setItem: (...empty[]) => mixed,
  +getItem: (key: string) => Promise<string | null>,
  +removeItem: string => Promise<mixed>,
  +getAllKeys: () => Promise<$ReadOnlyArray<string>>,
  ...
};

export type Config = {|
  +whitelist: string[],
  +storage: Storage,
  +serialize: (...empty[]) => mixed,
  +deserialize: string => mixed,
  +keyPrefix?: string,
|};
