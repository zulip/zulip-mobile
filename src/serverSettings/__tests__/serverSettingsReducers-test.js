import deepFreeze from 'deep-freeze';

import { NEW_SERVER_SETTINGS, REALM_INIT } from '../../actionConstants';
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

  describe('REALM_INIT', () => {
    test('if no entry exists creates and fills up with known data', () => {
      const prevState = deepFreeze({});
      const action = {
        type: REALM_INIT,
        data: {
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

    test('updates already stored data', () => {
      const prevState = deepFreeze({
        'https://example.com': {
          realm_name: 'Old name',
        },
      });
      const action = {
        type: REALM_INIT,
        data: {
          realm_uri: 'https://example.com',
          realm_name: 'New name',
          realm_icon_url: 'https://example.com/icon.png',
          extra_data: 'Not in server settings',
        },
      };
      const expectedState = {
        'https://example.com': {
          realm_uri: 'https://example.com',
          realm_name: 'New name',
          realm_icon: 'https://example.com/icon.png',
        },
      };

      const newState = serverSettingsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
