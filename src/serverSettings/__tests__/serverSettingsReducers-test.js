import deepFreeze from 'deep-freeze';

import { NEW_SERVER_SETTINGS } from '../../actionConstants';
import serverSettingsReducers from '../serverSettingsReducers';

describe('serverSettingsReducers', () => {
  describe('NEW_SERVER_SETTINGS', () => {
    test('stores new data mapped by `realm_uri`', () => {
      const prevState = deepFreeze({});
      const action = {
        type: NEW_SERVER_SETTINGS,
        serverSettings: {
          realm_uri: 'https://example.com',
          realm_name: 'Example',
        },
      };
      const expectedState = {
        'https://example.com': {
          realm_uri: 'https://example.com',
          realm_name: 'Example',
        },
      };

      const newState = serverSettingsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if data for realm already exists replaces with new data', () => {
      const prevState = deepFreeze({
        'https://example.com': {
          realm_uri: 'https://example.com',
          realm_name: 'Old name',
        },
      });
      const action = {
        type: NEW_SERVER_SETTINGS,
        serverSettings: {
          realm_uri: 'https://example.com',
          realm_name: 'New name',
        },
      };
      const expectedState = {
        'https://example.com': {
          realm_uri: 'https://example.com',
          realm_name: 'New name',
        },
      };

      const newState = serverSettingsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
