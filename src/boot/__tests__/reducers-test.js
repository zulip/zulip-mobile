import reducers, { reducersInner } from '../reducers';
import config from '../../config';

describe('reducers', () => {
  test('reducers return the default states on unknown action', () => {
    expect(() => reducers({}, { type: 'UNKNOWN_ACTION' })).not.toThrow();
  });

  test('every reducer is listed in config as "discard", "store" or "cache"', () => {
    const configKeys = [...config.discardKeys, ...config.storeKeys, ...config.cacheKeys];
    const reducerKeys = Object.keys(reducersInner);
    expect(configKeys).toHaveLength(reducerKeys.length);
    expect(configKeys.every(key => reducerKeys.includes(key))).toBeTruthy();
  });
});
