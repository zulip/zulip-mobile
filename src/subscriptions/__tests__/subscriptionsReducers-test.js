import {
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_SUBSCRIPTION_PEER_ADD,
} from '../../constants';
import subscriptionsReducers from '../subscriptionsReducers';

describe('subscriptionsReducers', () => {
  test('on unrecognized action, returns input state unchanged', () => {
    const prevState = { hello: 'world' };
    const newState = subscriptionsReducers(prevState, {});
    expect(newState).toEqual(prevState);
  });

  describe('EVENT_SUBSCRIPTION_ADD', () => {
    test('if new subscriptions do not exist in state, add them', () => {
      const prevState = [];
      const action = {
        type: EVENT_SUBSCRIPTION_ADD,
        subscriptions: [
          {
            name: 'some stream',
            stream_id: 1,
          },
          {
            name: 'some other stream',
            stream_id: 2,
          }
        ],
      };
      const expectedState = [
        {
          name: 'some stream',
          stream_id: 1,
        },
        {
          name: 'some other stream',
          stream_id: 2,
        }
      ];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if some of subscriptions already exist, do not add them', () => {
      const prevState = [
        {
          color: 'red',
          stream_id: 1,
          name: 'some stream'
        }
      ];
      const action = {
        type: EVENT_SUBSCRIPTION_ADD,
        subscriptions: [
          {
            name: 'some stream',
            stream_id: 1,
          },
          {
            name: 'some other stream',
            stream_id: 2,
          }
        ],
      };
      const expectedState = [
        {
          color: 'red',
          name: 'some stream',
          stream_id: 1,
        },
        {
          name: 'some other stream',
          stream_id: 2,
        }
      ];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_SUBSCRIPTION_REMOVE', () => {
    test('removes subscriptions from state', () => {
      const prevState = [
        {
          color: 'red',
          stream_id: 1,
          name: 'some stream'
        },
        {
          color: 'green',
          stream_id: 2,
          name: 'other stream'
        },
        {
          color: 'blue',
          stream_id: 3,
          name: 'third stream'
        },
      ];
      const action = {
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
      };
      const expectedState = [
        {
          color: 'blue',
          stream_id: 3,
          name: 'third stream'
        },
      ];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('removes subscriptions that exist, do nothing if not', () => {
      const prevState = [
        {
          name: 'some stream',
          stream_id: 1,
        },
      ];
      const action = {
        type: EVENT_SUBSCRIPTION_REMOVE,
        subscriptions: [
          {
            name: 'some stream',
            stream_id: 1,
          },
          {
            name: 'some other stream',
            stream_id: 2,
          }
        ],
      };
      const expectedState = [];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_SUBSCRIPTION_PEER_ADD', () => {
    test('adds user as subscriber of specified streams', () => {
      const prevState = [
        { stream_id: 1, subscribers: [] },
        { stream_id: 2, subscribers: [] },
      ];
      const action = {
        type: EVENT_SUBSCRIPTION_PEER_ADD,
        subscriptions: [1],
        user: { id: 1, email: 'john@example.com' },
      };
      const expectedState = [
        { stream_id: 1, subscribers: ['john@example.com'] },
        { stream_id: 2, subscribers: [] },
      ];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('adds user as subscriber to multiple streams', () => {
      const prevState = [
        { stream_id: 1, subscribers: [] },
        { stream_id: 2, subscribers: [] },
      ];
      const action = {
        type: EVENT_SUBSCRIPTION_PEER_ADD,
        subscriptions: [1, 2, 3],
        user: { id: 1, email: 'john@example.com' },
      };
      const expectedState = [
        { stream_id: 1, subscribers: ['john@example.com'] },
        { stream_id: 2, subscribers: ['john@example.com'] },
      ];

      const newState = subscriptionsReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
