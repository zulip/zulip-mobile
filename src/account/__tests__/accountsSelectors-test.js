/* @flow */
import deepFreeze from 'deep-freeze';

import { getActiveAccount } from '../accountsSelectors';
import { NULL_ACCOUNT } from '../../nullObjects';

test('getActiveAccount returns an empty object when no accounts', () => {
  const state = deepFreeze({
    accounts: [],
  });

  const auth = getActiveAccount(state);

  expect(auth).toBe(NULL_ACCOUNT);
});

test('getActiveAccount returns the auth information from the first account', () => {
  const state = deepFreeze({
    accounts: [{ realm: 'https://realm1.com' }, { realm: 'https://realm2.com' }],
  });

  const auth = getActiveAccount(state);

  expect(auth).toEqual({
    realm: 'https://realm1.com',
    email: undefined,
    apiKey: undefined,
  });
});
