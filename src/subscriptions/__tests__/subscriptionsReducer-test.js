import deepFreeze from 'deep-freeze';

import { EventTypes } from '../../api/eventTypes';
import { REALM_INIT, EVENT_SUBSCRIPTION, ACCOUNT_SWITCH, EVENT } from '../../actionConstants';
import subscriptionsReducer from '../subscriptionsReducer';

describe('subscriptionsReducer', () => {
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

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual([
        {
          name: 'some stream',
          stream_id: 1,
        },
      ]);
    });

    test('when `subscriptions` is an empty array, reset state', () => {
      const initialState = deepFreeze([
        {
          name: 'some stream',
          stream_id: 1,
        },
      ]);

      const action = deepFreeze({
        type: REALM_INIT,
        data: { subscriptions: [] },
      });

      const expectedState = [];

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
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

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  test('on unrecognized action, returns input state unchanged', () => {
    const prevState = deepFreeze({ hello: 'world' });

    const newState = subscriptionsReducer(prevState, {});
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

      const newState = subscriptionsReducer(prevState, action);

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

      const newState = subscriptionsReducer(prevState, action);

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

      const newState = subscriptionsReducer(prevState, action);

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

      const newState = subscriptionsReducer(prevState, action);

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

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_STREAM -> delete', () => {
    test('when a stream is delrted but user is not subscribed to it, do not change state', () => {
      const initialState = deepFreeze([
        {
          stream_id: 3,
          name: 'not subscribed to stream',
        },
      ]);
      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          op: 'delete',
          streams: [
            {
              name: 'some stream',
              stream_id: 1,
            },
          ],
        },
      });

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('when a stream is deleted the user is unsubscribed', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          name: 'some stream',
        },
      ]);
      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          op: 'delete',
          streams: [
            {
              name: 'some stream',
              stream_id: 1,
            },
            {
              name: 'some other stream',
              stream_id: 2,
            },
          ],
        },
      });
      const expectedState = [];

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when multiple streams are deleted the user is unsubscribed from all of them', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          name: 'some stream',
        },
        {
          name: 'some other stream',
          stream_id: 2,
        },
      ]);
      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          op: 'delete',
          streams: [
            {
              name: 'some stream',
              stream_id: 1,
            },
            {
              name: 'some other stream',
              stream_id: 2,
            },
          ],
        },
      });
      const expectedState = [];

      const actualState = subscriptionsReducer(initialState, action);

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

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
