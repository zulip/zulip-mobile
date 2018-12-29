import deepFreeze from 'deep-freeze';

import { getAuth, getPartialAuth, tryGetAuth } from '../accountsSelectors';

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

describe('getPartialAuth', () => {
  test('throws when no accounts', () => {
    const state = deepFreeze({
      accounts: [],
    });

    expect(() => {
      getPartialAuth(state);
    }).toThrow();
  });

  test('returns first account even when no API key', () => {
    const state = deepFreeze({
      accounts: [
        { apiKey: '', realm: 'https://realm1.com' },
        { apiKey: 'asdf', realm: 'https://realm2.com' },
      ],
    });

    expect(getPartialAuth(state)).toEqual(state.accounts[0]);
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
