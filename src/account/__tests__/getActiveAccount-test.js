import deepFreeze from 'deep-freeze';

import { getActiveAccount } from '../accountsSelectors';
import { NULL_ACCOUNT } from '../../nullObjects';

test('when no accounts exist, returns undefined', () => {
  const accounts = deepFreeze([]);

  const result = getActiveAccount({ accounts });
  expect(result).toBe(NULL_ACCOUNT);
});

test('returns first in the list', () => {
  const accounts = deepFreeze([{ name: 'account1' }, { name: 'account2' }]);

  const result = getActiveAccount({ accounts });
  expect(result).toEqual({ name: 'account1' });
});
