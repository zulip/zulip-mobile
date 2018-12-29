import deepFreeze from 'deep-freeze';

import { getAuth, tryGetValidAuth } from '../accountsSelectors';

describe('tryGetValidAuth', () => {
  test('returns undefined when no accounts', () => {
    const state = deepFreeze({
      accounts: [],
    });

    const auth = tryGetValidAuth(state);

    expect(auth).toBe(undefined);
  });

  test('returns undefined when no API key on active account', () => {
    const state = deepFreeze({
      accounts: [
        { apiKey: '', realm: 'https://realm1.com' },
        { apiKey: 'asdf', realm: 'https://realm2.com' },
      ],
    });

    expect(tryGetValidAuth(state)).toBe(undefined);
  });

  test('returns the auth information from the first account, if valid', () => {
    const state = deepFreeze({
      accounts: [
        { apiKey: 'asdf', realm: 'https://realm1.com' },
        { apiKey: 'aoeu', realm: 'https://realm2.com' },
      ],
    });

    expect(tryGetValidAuth(state)).toEqual({
      realm: 'https://realm1.com',
      apiKey: 'asdf',
    });
  });
});

describe('getAuth', () => {
  test('throws when no accounts', () => {
    const state = deepFreeze({
      accounts: [],
    });

    expect(() => {
      getAuth(state);
    }).toThrow();
  });

  test('returns first account even when no API key', () => {
    const state = deepFreeze({
      accounts: [
        { apiKey: '', realm: 'https://realm1.com' },
        { apiKey: 'asdf', realm: 'https://realm2.com' },
      ],
    });

    expect(getAuth(state)).toEqual(state.accounts[0]);
  });
});
