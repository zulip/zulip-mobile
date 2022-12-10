/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import { PRESENCE_RESPONSE, EVENT_PRESENCE } from '../../actionConstants';
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
      const prevState = deepFreeze(eg.baseReduxState.presence);
      const action = eg.mkActionRegisterComplete({ presences: presenceData });

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
      const action = eg.mkActionRegisterComplete({
        // Hmm, we should need a Flow suppression here. This property is
        // marked required in InitialData, and this explicit undefined is
        // meant to defy that; see TODO(#5102) above.
        // mkActionRegisterComplete is designed to accept input with this or
        // any property *omitted*… and I think, as a side effect of handling
        // that, Flow mistakenly accepts an explicit undefined here, so it
        // doesn't catch the resulting malformed InitialData.
        presences: undefined,
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
          aggregated: { status: 'active', timestamp: 123, client: 'website' },
          website: { status: 'active', timestamp: 123, client: 'website' },
        },
      };
      const action = deepFreeze({
        type: PRESENCE_RESPONSE,
        presence,
        serverTimestamp: 1474527537,
      });

      const prevState = deepFreeze({
        'email@example.com': {
          aggregated: { status: 'active', timestamp: 8, client: 'zulipMobile' },
          zulipMobile: { status: 'active', timestamp: 8, client: 'zulipMobile' },
        },
      });

      const expectedState = { ...prevState, ...presence };

      const newState = presenceReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('merges multiple users in presence response', () => {
      const prevState = deepFreeze({
        'email@example.com': {
          aggregated: { status: 'active', timestamp: 8, client: 'zulipMobile' },
          zulipMobile: { status: 'active', timestamp: 8, client: 'zulipMobile' },
        },
        'janedoe@example.com': {
          aggregated: { status: 'active', timestamp: 8, client: 'zulipMobile' },
          zulipMobile: { status: 'active', timestamp: 8, client: 'zulipMobile' },
        },
      });

      const presence = {
        'email@example.com': {
          aggregated: { client: 'website', status: 'active', timestamp: 123 },
          website: { client: 'website', status: 'active', timestamp: 123 },
        },
        'johndoe@example.com': {
          aggregated: { status: 'active', timestamp: 345, client: 'website' },
          website: { status: 'active', timestamp: 345, client: 'website' },
        },
      };
      const action = deepFreeze({
        type: PRESENCE_RESPONSE,
        presence,
        serverTimestamp: 12345,
      });

      const expectedState = { ...prevState, ...presence };

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
            client: 'website',
            status: 'idle',
            timestamp: currentTimestamp - 20,
          },
        },
      });

      const action = deepFreeze({
        id: 1,
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
            client: 'website',
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
      const prevState = deepFreeze({
        'email@example.com': {
          aggregated: { status: 'active', timestamp: 8, client: 'zulipMobile' },
          zulipMobile: { status: 'active', timestamp: 8, client: 'zulipMobile' },
        },
      });

      const action = eg.action.account_switch;

      const expectedState = {};

      const actualState = presenceReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
