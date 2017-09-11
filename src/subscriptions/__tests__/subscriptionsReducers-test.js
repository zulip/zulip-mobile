import deepFreeze from 'deep-freeze';

import {
  EVENT_STREAM_REMOVE,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  // EVENT_SUBSCRIPTION_PEER_ADD,
  // EVENT_SUBSCRIPTION_PEER_REMOVE,
  EVENT_SUBSCRIPTION_UPDATE,
  ACCOUNT_SWITCH,
  INIT_SUBSCRIPTIONS,
} from '../../actionConstants';
import subscriptionsReducers from '../subscriptionsReducers';

describe('subscriptionsReducers', () => {
  describe('INIT_SUBSCRIPTIONS', () => {
    test('when subscriptions are same in state as initialized', () => {
      const prevState = deepFreeze([
        {
          name: 'some stream',
          stream_id: 1,
        },
        {
          name: 'some other stream',
          stream_id: 2,
        },
      ]);

      const action = deepFreeze({
        type: INIT_SUBSCRIPTIONS,
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

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toBe(prevState);
    });
  });

  test('on unrecognized action, returns input state unchanged', () => {
    const prevState = deepFreeze({ hello: 'world' });

    const newState = subscriptionsReducers(prevState, {});
    expect(newState).toEqual(prevState);
  });

  describe('EVENT_SUBSCRIPTION_ADD', () => {
    test('if new subscriptions do not exist in state, add them', () => {
      const prevState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION_ADD,
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
        type: EVENT_SUBSCRIPTION_ADD,
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

  describe('EVENT_STREAM_REMOVE', () => {
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
        type: EVENT_STREAM_REMOVE,
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
        type: EVENT_STREAM_REMOVE,
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
      });

      const expectedState = [];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_SUBSCRIPTION_REMOVE', () => {
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
        type: EVENT_SUBSCRIPTION_REMOVE,
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
        type: EVENT_SUBSCRIPTION_REMOVE,
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

  describe('EVENT_SUBSCRIPTION_PEER_ADD', () => {
    // we currently ignore this event
    // test('adds user as subscriber of specified stream', () => {
    //   const prevState = deepFreeze([
    //     { stream_id: 1, subscribers: [] },
    //     { stream_id: 2, subscribers: [] },
    //   ]);
    //
    //   const action = deepFreeze({
    //     type: EVENT_SUBSCRIPTION_PEER_ADD,
    //     subscriptions: [1],
    //     user: { id: 1, email: 'john@example.com' },
    //   });
    //
    //   const expectedState = [
    //     { stream_id: 1, subscribers: ['john@example.com'] },
    //     { stream_id: 2, subscribers: [] },
    //   ];
    //
    //   const newState = subscriptionsReducers(prevState, action);
    //
    //   expect(newState).toEqual(expectedState);
    // });
    //
    // test('adds user as subscriber to multiple streams', () => {
    //   const prevState = deepFreeze([
    //     { stream_id: 1, subscribers: [] },
    //     { stream_id: 2, subscribers: [] },
    //   ]);
    //
    //   const action = deepFreeze({
    //     type: EVENT_SUBSCRIPTION_PEER_ADD,
    //     subscriptions: [1, 2, 3],
    //     user: { id: 1, email: 'john@example.com' },
    //   });
    //
    //   const expectedState = [
    //     { stream_id: 1, subscribers: ['john@example.com'] },
    //     { stream_id: 2, subscribers: ['john@example.com'] },
    //   ];
    //
    //   const newState = subscriptionsReducers(prevState, action);
    //
    //   expect(newState).toEqual(expectedState);
    // });
  });

  describe('EVENT_SUBSCRIPTION_PEER_REMOVE', () => {
    // we currently ignore this event
    // test('removes user as subscriber of specified stream', () => {
    //   const prevState = deepFreeze([
    //     { stream_id: 1, subscribers: ['john@example.com'] },
    //     { stream_id: 2, subscribers: [] },
    //   ]);
    //
    //   const action = deepFreeze({
    //     type: EVENT_SUBSCRIPTION_PEER_REMOVE,
    //     subscriptions: [1],
    //     user: { id: 1, email: 'john@example.com' },
    //   });
    //
    // const expectedState = [{ stream_id: 1, subscribers: [] }, { stream_id: 2, subscribers: [] }];
    //
    //   const newState = subscriptionsReducers(prevState, action);
    //
    //   expect(newState).toEqual(expectedState);
    // });
    //
    // test('removes user as subscriber from multiple streams', () => {
    //   const prevState = deepFreeze([
    //     { stream_id: 1, subscribers: ['john@example.com'] },
    //     { stream_id: 2, subscribers: ['john@example.com'] },
    //   ]);
    //
    //   const action = {
    //     type: EVENT_SUBSCRIPTION_PEER_REMOVE,
    //     subscriptions: [1, 2, 3],
    //     user: { id: 1, email: 'john@example.com' },
    //   };
    //
    // const expectedState = [{ stream_id: 1, subscribers: [] }, { stream_id: 2, subscribers: [] }];
    //
    //   const newState = subscriptionsReducers(prevState, action);
    //
    //   expect(newState).toEqual(expectedState);
    // });
  });

  describe('EVENT_SUBSCRIPTION_UPDATE', () => {
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
        type: EVENT_SUBSCRIPTION_UPDATE,
        eventId: 2,
        id: 2,
        name: 'competition',
        op: 'update',
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
