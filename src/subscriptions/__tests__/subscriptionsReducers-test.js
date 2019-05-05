import deepFreeze from 'deep-freeze';

import { REALM_INIT, EVENT_SUBSCRIPTION, ACCOUNT_SWITCH } from '../../actionConstants';
import subscriptionsReducers from '../subscriptionsReducers';

describe('subscriptionsReducers', () => {
  describe('REALM_INIT', () => {
    test('when `subscriptions` data is provided init state with it', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: REALM_INIT,
        data: {
          subscriptions: [
            {
              name: 'some stream',
              stream_id: 1,
            },
          ],
        },
      });

      const actualState = subscriptionsReducers(initialState, action);

      expect(actualState).toEqual([
        {
          name: 'some stream',
          stream_id: 1,
        },
      ]);
    });

    test('when no `subscriptions` data is given reset state', () => {
      const initialState = deepFreeze([
        {
          name: 'some stream',
          stream_id: 1,
        },
      ]);
      const action = deepFreeze({
        type: REALM_INIT,
        data: {},
      });
      const expectedState = [];

      const actualState = subscriptionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  test('on unrecognized action, returns input state unchanged', () => {
    const prevState = deepFreeze({ hello: 'world' });

    const newState = subscriptionsReducers(prevState, {});
    expect(newState).toEqual(prevState);
  });

  describe('EVENT_SUBSCRIPTION -> add', () => {
    test('if new subscriptions do not exist in state, add them', () => {
      const prevState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION,
        op: 'add',
        subscriptions: [
          {
            name: 'some stream',
            stream_id: 1,
          },
          {
            name: 'some other stream',
            stream_id: 2,
          },
        ],
      });

      const expectedState = [
        {
          name: 'some stream',
          stream_id: 1,
        },
        {
          name: 'some other stream',
          stream_id: 2,
        },
      ];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if some of subscriptions already exist, do not add them', () => {
      const prevState = deepFreeze([
        {
          color: 'red',
          stream_id: 1,
          name: 'some stream',
        },
      ]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION,
        op: 'add',
        subscriptions: [
          {
            name: 'some stream',
            stream_id: 1,
          },
          {
            name: 'some other stream',
            stream_id: 2,
          },
        ],
      });

      const expectedState = [
        {
          color: 'red',
          name: 'some stream',
          stream_id: 1,
        },
        {
          name: 'some other stream',
          stream_id: 2,
        },
      ];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_SUBSCRIPTION -> remove', () => {
    test('removes subscriptions from state', () => {
      const prevState = deepFreeze([
        {
          color: 'red',
          stream_id: 1,
          name: 'some stream',
        },
        {
          color: 'green',
          stream_id: 2,
          name: 'other stream',
        },
        {
          color: 'blue',
          stream_id: 3,
          name: 'third stream',
        },
      ]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION,
        op: 'remove',
        subscriptions: [
          {
            name: 'some stream',
            stream_id: 1,
          },
          {
            name: 'some other stream',
            stream_id: 2,
          },
        ],
      });

      const expectedState = [
        {
          color: 'blue',
          stream_id: 3,
          name: 'third stream',
        },
      ];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('removes subscriptions that exist, do nothing if not', () => {
      const prevState = deepFreeze([
        {
          name: 'some stream',
          stream_id: 1,
        },
      ]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION,
        op: 'remove',
        subscriptions: [
          {
            name: 'some stream',
            stream_id: 1,
          },
          {
            name: 'some other stream',
            stream_id: 2,
          },
        ],
      });

      const expectedState = [];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_SUBSCRIPTION -> update', () => {
    test('Change the in_home_view property', () => {
      const initialState = deepFreeze([
        {
          stream_id: 123,
          name: 'competition',
          in_home_view: false,
        },
        {
          stream_id: 67,
          name: 'design',
          in_home_view: false,
        },
        {
          stream_id: 53,
          name: 'mobile',
          in_home_view: true,
        },
      ]);

      const action = deepFreeze({
        stream_id: 123,
        type: EVENT_SUBSCRIPTION,
        op: 'update',
        eventId: 2,
        id: 2,
        name: 'competition',
        property: 'in_home_view',
        value: true,
      });

      const expectedState = [
        {
          stream_id: 123,
          name: 'competition',
          in_home_view: true,
        },
        {
          stream_id: 67,
          name: 'design',
          in_home_view: false,
        },
        {
          stream_id: 53,
          name: 'mobile',
          in_home_view: true,
        },
      ];

      const actualState = subscriptionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze(['some_stream']);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = subscriptionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
