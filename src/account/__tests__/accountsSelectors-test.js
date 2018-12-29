import deepFreeze from 'deep-freeze';

import { getAuth } from '../accountsSelectors';
import { NULL_ACCOUNT } from '../../nullObjects';

describe('getAuth', () => {
  test('returns an empty object when no accounts', () => {
    const state = deepFreeze({
      accounts: [],
    });

    const auth = getAuth(state);

    expect(auth).toBe(NULL_ACCOUNT);
  });

  test('returns the auth information from the first account', () => {
    const state = deepFreeze({
      accounts: [{ realm: 'https://realm1.com' }, { realm: 'https://realm2.com' }],
    });

    const auth = getAuth(state);

    expect(auth).toEqual({
      realm: 'https://realm1.com',
      email: undefined,
      apiKey: undefined,
    });
  });
});
