/* @flow */
import { PRESENCE_RESPONSE, EVENT_PRESENCE, ACCOUNT_SWITCH } from '../../actionConstants';
import presenceReducers, { activityFromPresence, timestampFromPresence } from '../presenceReducers';

const fiveSecsAgo = Math.floor(new Date() - 5) / 1000;

describe('presenceReducers', () => {
  test('handles unknown action and no state by returning initial state', () => {
    const newState = presenceReducers(undefined, {});
    expect(newState).toBeDefined();
  });

  test('on unrecognized action, returns input state unchanged', () => {
    const prevState = { hello: 'world' };
    const newState = presenceReducers(prevState, {});
    expect(newState).toEqual(prevState);
  });

  describe('activityFromPresence', () => {
    test('when single presence, just returns status', () => {
      const activity = activityFromPresence({
        website: {
          status: 'active',
        },
      });
      expect(activity).toEqual('active');
    });

    test('when multiple presences, the most "active" beats "offline"', () => {
      const activity = activityFromPresence({
        website: {
          status: 'offline',
        },
        mobile: {
          status: 'active',
        },
      });
      expect(activity).toEqual('active');
    });

    test('when multiple, the most "idle" beats "offline"', () => {
      const activity = activityFromPresence({
        website: {
          status: 'idle',
        },
        mobile: {
          status: 'offline',
        },
      });
      expect(activity).toEqual('idle');
    });
  });

  describe('timestampFromPresence', () => {
    test('when single client just return timestamp', () => {
      const activity = timestampFromPresence({
        website: {
          timestamp: 1475109413,
        },
      });
      expect(activity).toEqual(1475109413);
    });

    test('when multiple clients return more recent timestamp', () => {
      const activity = timestampFromPresence({
        website: {
          timestamp: 100,
        },
        mobile: {
          timestamp: 200,
        },
      });
      expect(activity).toEqual(200);
    });
  });

  describe('PRESENCE_RESPONSE', () => {
    test('merges a single user in presence response', () => {
      const presence = {
        'email@example.com': {
          website: {
            status: 'active',
            timestamp: fiveSecsAgo,
          },
        },
      };
      const prevState = [
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'offline',
        },
      ];
      const expectedState = [
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'active',
          timestamp: fiveSecsAgo,
        },
      ];

      const newState = presenceReducers(prevState, { type: PRESENCE_RESPONSE, presence });

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
            timestamp: fiveSecsAgo,
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
            status: 'active',
            timestamp: 1475792203,
            client: 'website',
            pushable: false,
          },
          ZulipAndroid: {
            status: 'active',
            timestamp: 1475109413,
            client: 'ZulipAndroid',
            pushable: false,
          },
        },
      };
      const prevState = [
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'offline',
        },
        {
          full_name: 'John Doe',
          email: 'johndoe@example.com',
          status: 'offline',
        },
        {
          full_name: 'Jane Doe',
          email: 'janedoe@example.com',
          status: 'offline',
        },
      ];
      const expectedState = [
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'offline',
          timestamp: 1474527507,
        },
        {
          full_name: 'John Doe',
          email: 'johndoe@example.com',
          status: 'active',
          timestamp: fiveSecsAgo,
        },
        {
          full_name: 'Jane Doe',
          email: 'janedoe@example.com',
          status: 'offline',
          timestamp: 1475792203,
        },
      ];

      const newState = presenceReducers(prevState, { type: PRESENCE_RESPONSE, presence });

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_PRESENCE', () => {
    test('merges a single user presence', () => {
      const prevState = [
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'offline',
        },
      ];
      const action = {
        type: EVENT_PRESENCE,
        email: 'email@example.com',
        presence: {
          website: {
            status: 'active',
            timestamp: fiveSecsAgo,
          },
        },
      };
      const expectedState = [
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'active',
          timestamp: fiveSecsAgo,
        },
      ];

      const newState = presenceReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = [
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'offline',
        },
      ];
      const action = {
        type: ACCOUNT_SWITCH,
      };
      const expectedState = [];

      const actualState = presenceReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
