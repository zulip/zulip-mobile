import reducers, { allKeys } from '../reducers';
import config from '../../config';

describe('reducers', () => {
  test('reducers return the default states on unknown action', () => {
    expect(() => reducers({}, { type: 'UNKNOWN_ACTION' })).not.toThrow();
  });

  test('every reducer is listed in config as "discard", "store" or "cache"', () => {
    const configKeys = [...config.discardKeys, ...config.storeKeys, ...config.cacheKeys];
    expect(configKeys).toHaveLength(allKeys.length);
    expect(configKeys.every(key => allKeys.includes(key))).toBeTruthy();
  });
});
