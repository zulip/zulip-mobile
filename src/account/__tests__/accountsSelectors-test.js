import deepFreeze from 'deep-freeze';

import { getAuth, tryGetAuth } from '../accountsSelectors';

describe('tryGetAuth', () => {
  test('returns undefined when no accounts', () => {
    const state = deepFreeze({
      accounts: [],
    });

    const auth = tryGetAuth(state);

    expect(auth).toBe(undefined);
  });

  test('returns undefined when no API key on active account', () => {
    const state = deepFreeze({
      accounts: [
        { apiKey: '', realm: 'https://realm1.com' },
        { apiKey: 'asdf', realm: 'https://realm2.com' },
      ],
    });

    expect(tryGetAuth(state)).toBe(undefined);
  });

  test('returns the auth information from the first account, if valid', () => {
    const state = deepFreeze({
      accounts: [
        { apiKey: 'asdf', realm: 'https://realm1.com' },
        { apiKey: 'aoeu', realm: 'https://realm2.com' },
      ],
    });

    expect(tryGetAuth(state)).toEqual({
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

  test('throws when no API key', () => {
    const state = deepFreeze({
      accounts: [
        { apiKey: '', realm: 'https://realm1.com' },
        { apiKey: 'asdf', realm: 'https://realm2.com' },
      ],
    });

    expect(() => {
      getAuth(state);
    }).toThrow();
  });
});
