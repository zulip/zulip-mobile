/* @flow */
import deepFreeze from 'deep-freeze';

import { getActiveAccount } from '../accountsSelectors';
import { NULL_ACCOUNT } from '../../nullObjects';

test('getActiveAccount returns an empty object when no accounts', () => {
  const state = deepFreeze({
    accounts: [],
  });

  const account = getActiveAccount(state);

  expect(account).toBe(NULL_ACCOUNT);
});

test('getActiveAccount returns the account information from the first account', () => {
  const state = deepFreeze({
    accounts: [{ realm: 'https://realm1.com' }, { realm: 'https://realm2.com' }],
  });

  const account = getActiveAccount(state);

  expect(account).toEqual({
    realm: 'https://realm1.com',
    email: undefined,
    apiKey: undefined,
  });
});
