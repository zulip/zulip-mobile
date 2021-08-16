import deepFreeze from 'deep-freeze';

import {
  REGISTER_COMPLETE,
  PRESENCE_RESPONSE,
  EVENT_PRESENCE,
  ACCOUNT_SWITCH,
} from '../../actionConstants';
import presenceReducer from '../presenceReducer';

const currentTimestamp = Date.now() / 1000;

describe('presenceReducer', () => {
  test('handles unknown action and no state by returning initial state', () => {
    const newState = presenceReducer(undefined, {});
    expect(newState).toBeDefined();
  });

  test('on unrecognized action, returns input state unchanged', () => {
    const prevState = deepFreeze({ hello: 'world' });

    const newState = presenceReducer(prevState, {});
    expect(newState).toBe(prevState);
  });

  describe('REGISTER_COMPLETE', () => {
    test('when `presence` data is provided init state with it', () => {
      const presenceData = {
        'email@example.com': {
          aggregated: {
            client: 'website',
            status: 'active',
            timestamp: 123,
          },
        },
      };
      const initialState = deepFreeze({});
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {
          presences: presenceData,
        },
      });

      const actualState = presenceReducer(initialState, action);

      expect(actualState).toEqual(presenceData);
    });

    test('when no `presence` data is given reset state', () => {
      const initialState = deepFreeze({
        'email@example.com': {
          aggregated: {
            client: 'website',
            status: 'active',
            timestamp: 123,
          },
        },
      });
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {},
      });
      const expectedState = {};

      const actualState = presenceReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
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

      const newState = presenceReducer(prevState, action);

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

      const newState = presenceReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_PRESENCE', () => {
    test('merges a single user presence', () => {
      const prevState = deepFreeze({
        'email@example.com': {
          aggregated: {
            client: 'website',
            status: 'idle',
            timestamp: currentTimestamp - 20,
          },
          website: {
            status: 'idle',
            timestamp: currentTimestamp - 20,
          },
        },
      });

      const action = deepFreeze({
        type: EVENT_PRESENCE,
        email: 'email@example.com',
        server_timestamp: 200,
        presence: {
          zulipMobile: {
            client: 'zulipMobile',
            status: 'active',
            timestamp: currentTimestamp - 10,
          },
        },
      });

      const expectedState = {
        'email@example.com': {
          aggregated: {
            client: 'zulipMobile',
            status: 'active',
            timestamp: currentTimestamp - 10,
          },
          website: {
            status: 'idle',
            timestamp: currentTimestamp - 20,
          },
          zulipMobile: {
            client: 'zulipMobile',
            status: 'active',
            timestamp: currentTimestamp - 10,
          },
        },
      };

      const newState = presenceReducer(prevState, action);

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

      const actualState = presenceReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
