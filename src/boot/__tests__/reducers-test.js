/* @flow strict-local */
import reducers, { ALL_KEYS } from '../reducers';
import { discardKeys, storeKeys, cacheKeys } from '../../boot/store';

describe('reducers', () => {
  test('reducers return the default states on unknown action', () => {
    // $FlowFixMe bogus action object
    expect(() => reducers({}, { type: 'UNKNOWN_ACTION' })).not.toThrow();
  });

  test('every reducer is listed in config as "discard", "store" or "cache"', () => {
    const configKeys = [...discardKeys, ...storeKeys, ...cacheKeys];
    expect(configKeys).toHaveLength(ALL_KEYS.length);
    expect(configKeys.every(key => ALL_KEYS.includes(key))).toBeTruthy();
  });
});
