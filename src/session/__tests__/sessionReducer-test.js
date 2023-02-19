/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import {
  DEAD_QUEUE,
  APP_ONLINE,
  REGISTER_ABORT,
  APP_ORIENTATION,
  GOT_PUSH_TOKEN,
  TOGGLE_OUTBOX_SENDING,
  DISMISS_SERVER_COMPAT_NOTICE,
  REGISTER_START,
} from '../../actionConstants';
import sessionReducer, { initialPerAccountSessionState } from '../sessionReducer';
import * as eg from '../../__tests__/lib/exampleData';

describe('sessionReducer', () => {
  const baseState = eg.baseReduxState.session;

  describe('RESET_ACCOUNT_DATA', () => {
    test('resets per-account state without touching global state', () => {
      const prevState = [
        // per-account
        eg.action.register_complete,
        { type: DISMISS_SERVER_COMPAT_NOTICE },

        // global
        { type: GOT_PUSH_TOKEN, pushToken: '456' },
        { type: APP_ORIENTATION, orientation: 'LANDSCAPE' },
      ].reduce(sessionReducer, eg.baseReduxState.session);
      expect(sessionReducer(prevState, eg.action.reset_account_data)).toEqual({
        ...prevState,
        ...initialPerAccountSessionState,
      });
    });
  });

  test('DEAD_QUEUE', () => {
    const state = deepFreeze({ ...baseState, loading: true });
    const newState = sessionReducer(state, deepFreeze({ type: DEAD_QUEUE }));
    expect(newState).toEqual({ ...baseState, loading: false });
  });

  test('REGISTER_COMPLETE', () => {
    const state = deepFreeze({ ...baseState, loading: true });
    const action = eg.mkActionRegisterComplete({ queue_id: '100' });
    const newState = sessionReducer(state, action);
    expect(newState).toEqual({
      ...baseState,
      loading: false,
      eventQueueId: '100',
    });
  });

  test('APP_ONLINE', () => {
    const state = deepFreeze({ ...baseState, isOnline: false });
    const action = deepFreeze({ type: APP_ONLINE, isOnline: true });
    const newState = sessionReducer(state, action);
    expect(newState).toEqual({ ...baseState, isOnline: true });
  });

  test('REGISTER_ABORT', () => {
    const state = deepFreeze({ ...baseState, loading: true });
    const newState = sessionReducer(state, deepFreeze({ type: REGISTER_ABORT, reason: 'server' }));
    expect(newState).toEqual({ ...baseState, loading: false });
  });

  test('REGISTER_START', () => {
    const state = deepFreeze({ ...baseState, loading: false });
    const newState = sessionReducer(state, deepFreeze({ type: REGISTER_START }));
    expect(newState).toEqual({ ...baseState, loading: true });
  });

  test('APP_ORIENTATION', () => {
    const state = deepFreeze({ ...baseState, orientation: 'PORTRAIT' });
    const orientation = 'LANDSCAPE';
    const action = deepFreeze({ type: APP_ORIENTATION, orientation });
    expect(sessionReducer(state, action)).toEqual({ ...baseState, orientation });
  });

  test('GOT_PUSH_TOKEN', () => {
    const pushToken = 'pushToken';
    const action = deepFreeze({ type: GOT_PUSH_TOKEN, pushToken });
    expect(sessionReducer(baseState, action)).toEqual({ ...baseState, pushToken });
  });

  test('TOGGLE_OUTBOX_SENDING', () => {
    const state = deepFreeze({ ...baseState, outboxSending: false });
    expect(
      sessionReducer(state, deepFreeze({ type: TOGGLE_OUTBOX_SENDING, sending: true })),
    ).toEqual({ ...baseState, outboxSending: true });
  });

  test('DISMISS_SERVER_COMPAT_NOTICE', () => {
    const action = deepFreeze({ type: DISMISS_SERVER_COMPAT_NOTICE });
    expect(sessionReducer(baseState, action)).toEqual({
      ...baseState,
      hasDismissedServerCompatNotice: true,
    });
  });
});
