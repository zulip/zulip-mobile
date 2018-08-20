/* @flow */
import deepFreeze from 'deep-freeze';

import { getCurrentServerSettings } from '../serverSettingsSelectors';

describe('getCurrentServerSettings', () => {
  test('returns the realm settings for the active account', () => {
    const state = deepFreeze({
      accounts: [{ realm: 'https://realm1.com' }, { realm: 'https://realm2.com' }],
      serverSettings: {
        'https://realm1.com': {
          realm_name: 'Realm 1',
        },
        'https://realm2.com': {
          realm_name: 'Realm 2',
        },
      },
    });

    const auth = getCurrentServerSettings(state);

    expect(auth).toEqual({
      realm_name: 'Realm 1',
    });
  });

  test('if no settings are found returns an empty object', () => {
    const state = deepFreeze({
      accounts: [{ realm: 'https://example.com' }],
      serverSettings: {},
    });

    const auth = getCurrentServerSettings(state);

    expect(auth).toEqual({});
  });
});
