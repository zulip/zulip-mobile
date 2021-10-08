/* @flow strict-local */

type Storage = {
  +setItem: (...empty[]) => mixed,
  +getItem: (...empty[]) => mixed,
  +removeItem: string => Promise<mixed>,
  +getAllKeys: () => Promise<$ReadOnlyArray<string>>,
  ...
};

export type Config = {|
  +whitelist: string[],
  +storage?: Storage,
  +serialize: (...empty[]) => mixed,
  +deserialize: (...empty[]) => mixed,
  +keyPrefix?: string,
|};
