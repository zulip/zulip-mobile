/* @flow */
import deepFreeze from 'deep-freeze';

import { PRESENCE_RESPONSE, EVENT_PRESENCE, ACCOUNT_SWITCH } from '../../actionConstants';
import presenceReducers, { updateUserWithPresence } from '../presenceReducers';

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

  describe('updateUserWithPresence', () => {
    test('if there is aggregated object present, use that', () => {
      const presence = {
        website: {
          client: 'website',
          status: 'active',
          timestamp: 1474527507,
        },
        aggregated: {
          client: 'website',
          status: 'active',
          timestamp: 1474527577,
        },
        ZulipMobile: {
          client: 'ZulipMobile',
          status: 'idle',
          timestamp: 1474527577,
        },
      };

      deepFreeze(presence);

      const expectedResult = {
        client: 'website',
        status: 'active',
        timestamp: 1474527577,
        email: 'joe@a.com',
        age: 10,
      };

      const actualResult = updateUserWithPresence({ email: 'joe@a.com' }, presence, 1474527587);

      expect(actualResult).toEqual(expectedResult);
    });
    test('if there is no aggregated object present, get presence from latest device', () => {
      const presence = {
        website: {
          client: 'website',
          status: 'offline',
          timestamp: 1474527507,
        },
        ZulipMobile: {
          client: 'ZulipMobile',
          status: 'active',
          timestamp: 1474527517,
        },
      };

      deepFreeze(presence);

      const expectedResult = {
        client: 'ZulipMobile',
        status: 'active',
        timestamp: 1474527517,
        email: 'joe@a.com',
        age: 3,
      };

      const actualResult = updateUserWithPresence({ email: 'joe@a.com' }, presence, 1474527520);

      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('PRESENCE_RESPONSE', () => {
    test('merges a single user in presence response', () => {
      const presence = {
        'email@example.com': {
          website: {
            client: 'website',
            status: 'active',
            timestamp: 1474527507,
          },
        },
      };
      const action = deepFreeze({
        type: PRESENCE_RESPONSE,
        presence,
        serverTimestamp: 1474527537,
      });

      const prevState = deepFreeze([
        {
          email: 'email@example.com',
          status: 'offline',
        },
      ]);

      const expectedState = [
        {
          email: 'email@example.com',
          status: 'active',
          timestamp: 1474527507,
          age: 30,
          client: 'website',
        },
      ];

      const newState = presenceReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('merges multiple users in presence response', () => {
      const presence = {
        'email@example.com': {
          website: {
            status: 'active',
            timestamp: 1474527507,
            client: 'website',
            pushable: false,
          },
        },
        'johndoe@example.com': {
          website: {
            status: 'active',
            timestamp: 1475792255,
            client: 'website',
            pushable: false,
          },
          ZulipReactNative: {
            status: 'active',
            timestamp: 1475792205,
            client: 'ZulipReactNative',
            pushable: false,
          },
          ZulipAndroid: {
            status: 'active',
            timestamp: 1475455046,
            client: 'ZulipAndroid',
            pushable: false,
          },
        },
        'janedoe@example.com': {
          website: {
            status: 'idle',
            timestamp: 1475792202,
            client: 'website',
            pushable: false,
          },
          ZulipAndroid: {
            status: 'active',
            timestamp: 1475792203,
            client: 'ZulipAndroid',
            pushable: false,
          },
        },
      };
      const action = deepFreeze({
        type: PRESENCE_RESPONSE,
        presence,
        serverTimestamp: 1475792265,
      });

      const prevState = deepFreeze([
        {
          email: 'email@example.com',
          status: 'offline',
        },
        {
          email: 'johndoe@example.com',
          status: 'offline',
        },
        {
          email: 'janedoe@example.com',
          status: 'offline',
        },
      ]);

      const expectedState = [
        {
          email: 'email@example.com',
          status: 'active',
          timestamp: 1474527507,
          age: 1264758,
          client: 'website',
          pushable: false,
        },
        {
          email: 'johndoe@example.com',
          status: 'active',
          timestamp: 1475792255,
          age: 10,
          client: 'website',
          pushable: false,
        },
        {
          email: 'janedoe@example.com',
          status: 'active',
          timestamp: 1475792203,
          age: 62,
          client: 'ZulipAndroid',
          pushable: false,
        },
      ];

      const newState = presenceReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_PRESENCE', () => {
    test('merges a single user presence', () => {
      const prevState = deepFreeze([
        {
          email: 'email@example.com',
          status: 'offline',
          timestamp: 200,
          age: 100,
        },
      ]);

      const action = deepFreeze({
        type: EVENT_PRESENCE,
        email: 'email@example.com',
        server_timestamp: 200,
        presence: {
          website: {
            status: 'active',
            timestamp: 150,
          },
        },
      });

      const expectedState = [
        {
          email: 'email@example.com',
          status: 'active',
          timestamp: 150,
          age: 50,
        },
      ];

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

      const expectedState = [];

      const actualState = presenceReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
