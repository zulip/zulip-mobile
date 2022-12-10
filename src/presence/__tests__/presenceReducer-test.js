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
  describe('REGISTER_COMPLETE', () => {
    test('when `presence` data is provided init state with it', () => {
      const presenceData = {
        'email@example.com': {
          aggregated: { client: 'website', status: 'active', timestamp: 123 },
          website: { client: 'website', status: 'active', timestamp: 123 },
        },
      };
      const prevState = deepFreeze({});
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {
          presences: presenceData,
        },
      });

      const actualState = presenceReducer(prevState, action);

      expect(actualState).toEqual(presenceData);
    });

    // TODO(#5102): Delete; see comment on implementation.
    test('when no `presence` data is given reset state', () => {
      const prevState = deepFreeze({
        'email@example.com': {
          aggregated: { client: 'website', status: 'active', timestamp: 123 },
          website: { client: 'website', status: 'active', timestamp: 123 },
        },
      });
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {},
      });
      const expectedState = {};

      const actualState = presenceReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('PRESENCE_RESPONSE', () => {
    test('merges a single user in presence response', () => {
      const presence = {
        'email@example.com': {
          aggregated: { status: 'active', timestamp: 123 },
          website: { status: 'active', timestamp: 123 },
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
          aggregated: { status: 'active', timestamp: 123 },
          website: { status: 'active', timestamp: 123 },
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
          aggregated: { client: 'website', status: 'active', timestamp: 123 },
          website: { client: 'website', status: 'active', timestamp: 123 },
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
          aggregated: { client: 'website', status: 'active', timestamp: 123 },
          website: { client: 'website', status: 'active', timestamp: 123 },
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
      const prevState = deepFreeze([
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

      const actualState = presenceReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
