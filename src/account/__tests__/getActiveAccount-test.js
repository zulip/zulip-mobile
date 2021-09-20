import deepFreeze from 'deep-freeze';

import { tryGetActiveAccount } from '../accountsSelectors';

describe('tryGetActiveAccount', () => {
  test('when no accounts exist, returns undefined', () => {
    const accounts = deepFreeze([]);

    const result = tryGetActiveAccount({ accounts });
    expect(result).toBe(undefined);
  });

  test('returns first in the list', () => {
    const accounts = deepFreeze([{ name: 'account1' }, { name: 'account2' }]);

    const result = tryGetActiveAccount({ accounts });
    expect(result).toEqual({ name: 'account1' });
  });
});
