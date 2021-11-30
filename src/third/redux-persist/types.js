/* @flow strict-local */

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

export type Persistor = {
  purge: (keys?: Array<string>) => void | Promise<mixed>,
  pause: () => void,
  resume: () => void,
  ...
};
