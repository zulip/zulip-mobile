import deepFreeze from 'deep-freeze';

import { getAuth } from '../accountsSelectors';

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

  test('returns the auth information from the first account, if valid', () => {
    const state = deepFreeze({
      accounts: [
        { apiKey: 'asdf', realm: 'https://realm1.com' },
        { apiKey: 'aoeu', realm: 'https://realm2.com' },
      ],
    });

    expect(getAuth(state)).toEqual({
      realm: 'https://realm1.com',
      apiKey: 'asdf',
    });
  });
});
