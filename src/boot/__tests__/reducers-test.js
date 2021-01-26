/* @flow strict-local */
import reducers from '../reducers';
import { discardKeys, storeKeys, cacheKeys } from '../store';
import * as eg from '../../__tests__/lib/exampleData';

describe('reducers', () => {
  test('reducers return the default states on unknown action', () => {
    // $FlowFixMe bogus action object
    expect(() => reducers({}, { type: 'UNKNOWN_ACTION' })).not.toThrow();
  });

  test('every reducer is listed in config as "discard", "store" or "cache"', () => {
    const configKeys = [...discardKeys, ...storeKeys, ...cacheKeys];
    const reducerKeys = Object.keys(eg.baseReduxState);
    expect(configKeys.sort()).toEqual(reducerKeys.sort());
  });
});
