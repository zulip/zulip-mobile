/* @flow */
import deepFreeze from 'deep-freeze';

import { getAuth } from '../accountSelectors';
import { NULL_ACCOUNT } from '../../nullObjects';

test('getAuth returns an empty object when no accounts', () => {
  const state = {
    accounts: [],
  };
  deepFreeze(state);

  const auth = getAuth(state);

  expect(auth).toBe(NULL_ACCOUNT);
});

test('getAuth returns the auth information from the first account', () => {
  const state = {
    accounts: [{ realm: 'https://realm1.com' }, { realm: 'https://realm2.com' }],
  };
  deepFreeze(state);

  const auth = getAuth(state);

  expect(auth).toEqual({
    realm: 'https://realm1.com',
    email: undefined,
    apiKey: undefined,
  });
});
