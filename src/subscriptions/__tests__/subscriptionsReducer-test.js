/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import { EventTypes } from '../../api/eventTypes';
import { EVENT_SUBSCRIPTION, ACCOUNT_SWITCH, EVENT } from '../../actionConstants';
import subscriptionsReducer from '../subscriptionsReducer';
import * as eg from '../../__tests__/lib/exampleData';

describe('subscriptionsReducer', () => {
  const stream1 = eg.makeStream({ name: 'stream1', description: 'my first stream' });
  const sub1 = eg.makeSubscription({ stream: stream1 });

  const stream2 = eg.makeStream({ name: 'stream2', description: 'my second stream' });
  const sub2 = eg.makeSubscription({ stream: stream2 });

  const stream3 = eg.makeStream({ name: 'stream3', description: 'my third stream' });
  const sub3 = eg.makeSubscription({ stream: stream3 });

  describe('REALM_INIT', () => {
    test('when `subscriptions` data is provided init state with it', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        ...eg.action.realm_init,
        data: {
          ...eg.action.realm_init.data,
          subscriptions: [sub1],
        },
      });

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual([sub1]);
    });

    test('when `subscriptions` is an empty array, reset state', () => {
      const initialState = deepFreeze([sub1]);

      const action = deepFreeze({
        ...eg.action.realm_init,
        data: {
          ...eg.action.realm_init.data,
          subscriptions: [],
        },
      });

      const expectedState = [];

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_SUBSCRIPTION -> add', () => {
    test('if new subscriptions do not exist in state, add them', () => {
      const prevState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION,
        op: 'add',
        id: 1,
        subscriptions: [sub1, sub2],
      });

      const expectedState = [sub1, sub2];

      const newState = subscriptionsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if some of subscriptions already exist, do not add them', () => {
      const prevState = deepFreeze([sub1]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION,
        op: 'add',
        id: 1,
        subscriptions: [sub1, sub2],
      });

      const expectedState = [sub1, sub2];

      const newState = subscriptionsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_SUBSCRIPTION -> remove', () => {
    test('removes subscriptions from state', () => {
      const prevState = deepFreeze([sub1, sub2, sub3]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION,
        op: 'remove',
        id: 1,
        subscriptions: [sub1, sub2],
      });

      const expectedState = [sub3];

      const newState = subscriptionsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('removes subscriptions that exist, do nothing if not', () => {
      const prevState = deepFreeze([sub1]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION,
        op: 'remove',
        id: 1,
        subscriptions: [sub1, sub2],
      });

      const expectedState = [];

      const newState = subscriptionsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_SUBSCRIPTION -> update', () => {
    test('Change the in_home_view property', () => {
      const subNotInHomeView = deepFreeze({
        ...eg.makeSubscription({
          stream: stream1,
        }),
        in_home_view: false,
      });

      const initialState = deepFreeze([subNotInHomeView, sub2, sub3]);

      const action = deepFreeze({
        type: EVENT_SUBSCRIPTION,
        op: 'update',
        id: 2,
        email: subNotInHomeView.email_address,
        stream_id: subNotInHomeView.stream_id,
        name: subNotInHomeView.name,
        property: 'in_home_view',
        value: true,
      });

      const actualState = subscriptionsReducer(initialState, action);
      const expectedState = [{ ...subNotInHomeView, in_home_view: true }, sub2, sub3];

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_STREAM -> delete', () => {
    test('when a stream is delrted but user is not subscribed to it, do not change state', () => {
      const initialState = deepFreeze([sub3]);
      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          id: 1,
          op: 'delete',
          streams: [stream1],
        },
      });

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('when a stream is deleted the user is unsubscribed', () => {
      const initialState = deepFreeze([sub1]);
      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          id: 1,
          op: 'delete',
          streams: [stream1, stream2],
        },
      });
      const expectedState = [];

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when multiple streams are deleted the user is unsubscribed from all of them', () => {
      const initialState = deepFreeze([sub1, sub2]);
      const action = deepFreeze({
        type: EVENT,
        event: {
          type: EventTypes.stream,
          id: 1,
          op: 'delete',
          streams: [stream1, stream2],
        },
      });
      const expectedState = [];

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([sub1]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 2,
      });

      const expectedState = [];

      const actualState = subscriptionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
