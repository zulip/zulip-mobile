/* @flow */
import deepFreeze from 'deep-freeze';

import { PRESENCE_RESPONSE, EVENT_PRESENCE, ACCOUNT_SWITCH } from '../../actionConstants';
import presenceReducers from '../presenceReducers';

describe('presenceReducers', () => {
  test('handles unknown action and no state by returning initial state', () => {
    const newState = presenceReducers(undefined, {});
    expect(newState).toBeDefined();
  });

  test('on unrecognized action, returns input state unchanged', () => {
    const prevState = deepFreeze({ hello: 'world' });

    const newState = presenceReducers(prevState, {});
    expect(newState).toBe(prevState);
  });

  describe('PRESENCE_RESPONSE', () => {
    test('merges a single user in presence response', () => {
      const presence = {
        'email@example.com': {
          aggregated: {
            status: 'active',
            timestamp: 123,
          },
        },
      };
      const action = deepFreeze({
        type: PRESENCE_RESPONSE,
        presence,
        serverTimestamp: 1474527537,
      });

      const prevState = deepFreeze({
        'email@example.com': {},
      });

      const expectedState = {
        'email@example.com': {
          aggregated: {
            status: 'active',
            timestamp: 123,
          },
        },
      };

      const newState = presenceReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('merges multiple users in presence response', () => {
      const prevState = deepFreeze({
        'email@example.com': {},
        'janedoe@example.com': {},
      });

      const presence = {
        'email@example.com': {
          aggregated: {
            client: 'website',
            status: 'active',
            timestamp: 123,
          },
        },
        'johndoe@example.com': {
          website: {
            status: 'active',
            timestamp: 345,
            client: 'website',
          },
        },
      };
      const action = deepFreeze({
        type: PRESENCE_RESPONSE,
        presence,
        serverTimestamp: 12345,
      });

      const expectedState = {
        'email@example.com': {
          aggregated: {
            client: 'website',
            status: 'active',
            timestamp: 123,
          },
        },
        'johndoe@example.com': {
          website: {
            status: 'active',
            timestamp: 345,
            client: 'website',
          },
        },
        'janedoe@example.com': {},
      };

      const newState = presenceReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_PRESENCE', () => {
    test('merges a single user presence', () => {
      const prevState = deepFreeze({
        'email@example.com': {
          aggregated: {
            client: 'website',
            status: 'active',
            timestamp: 123,
          },
          website: {
            status: 'active',
            timestamp: 123,
          },
        },
      });

      const action = deepFreeze({
        type: EVENT_PRESENCE,
        email: 'email@example.com',
        server_timestamp: 200,
        presence: {
          aggregated: {
            client: 'mobile',
            status: 'active',
            timestamp: 160,
          },
        },
      });

      const expectedState = {
        'email@example.com': {
          aggregated: {
            client: 'mobile',
            status: 'active',
            timestamp: 160,
          },
          website: {
            status: 'active',
            timestamp: 123,
          },
        },
      };

      const newState = presenceReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'offline',
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = {};

      const actualState = presenceReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
