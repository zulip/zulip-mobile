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
      ].reduce(
        (state, action) => sessionReducer(state, action, eg.plusReduxState),
        eg.baseReduxState.session,
      );
      expect(sessionReducer(prevState, eg.action.reset_account_data, eg.plusReduxState)).toEqual({
        ...prevState,
        ...initialPerAccountSessionState,
      });
    });
  });

  test('DEAD_QUEUE', () => {
    const state = deepFreeze({ ...baseState, loading: true });
    const newState = sessionReducer(state, deepFreeze({ type: DEAD_QUEUE }), eg.plusReduxState);
    expect(newState).toEqual({ ...baseState, loading: false });
  });

  test('REGISTER_COMPLETE', () => {
    const state = deepFreeze({ ...baseState, loading: true });
    const action = eg.mkActionRegisterComplete({ queue_id: '100' });
    const newState = sessionReducer(state, action, eg.plusReduxState);
    expect(newState).toEqual({
      ...baseState,
      loading: false,
      eventQueueId: '100',
    });
  });

  test('APP_ONLINE', () => {
    const state = deepFreeze({ ...baseState, isOnline: false });
    const action = deepFreeze({ type: APP_ONLINE, isOnline: true });
    const newState = sessionReducer(state, action, eg.plusReduxState);
    expect(newState).toEqual({ ...baseState, isOnline: true });
  });

  test('REGISTER_ABORT', () => {
    const state = deepFreeze({ ...baseState, loading: true });
    const newState = sessionReducer(
      state,
      deepFreeze({ type: REGISTER_ABORT, reason: 'server' }),
      eg.plusReduxState,
    );
    expect(newState).toEqual({ ...baseState, loading: false });
  });

  test('REGISTER_START', () => {
    const state = deepFreeze({ ...baseState, loading: false });
    const newState = sessionReducer(state, deepFreeze({ type: REGISTER_START }), eg.plusReduxState);
    expect(newState).toEqual({ ...baseState, loading: true });
  });

  test('APP_ORIENTATION', () => {
    const state = deepFreeze({ ...baseState, orientation: 'PORTRAIT' });
    const orientation = 'LANDSCAPE';
    const action = deepFreeze({ type: APP_ORIENTATION, orientation });
    expect(sessionReducer(state, action, eg.plusReduxState)).toEqual({ ...baseState, orientation });
  });

  test('GOT_PUSH_TOKEN', () => {
    const pushToken = 'pushToken';
    const action = deepFreeze({ type: GOT_PUSH_TOKEN, pushToken });
    expect(sessionReducer(baseState, action, eg.plusReduxState)).toEqual({
      ...baseState,
      pushToken,
    });
  });

  test('TOGGLE_OUTBOX_SENDING', () => {
    const state = deepFreeze({ ...baseState, outboxSending: false });
    expect(
      sessionReducer(
        state,
        deepFreeze({ type: TOGGLE_OUTBOX_SENDING, sending: true }),
        eg.plusReduxState,
      ),
    ).toEqual({ ...baseState, outboxSending: true });
  });

  test('DISMISS_SERVER_COMPAT_NOTICE', () => {
    const action = deepFreeze({ type: DISMISS_SERVER_COMPAT_NOTICE });
    expect(sessionReducer(baseState, action, eg.plusReduxState)).toEqual({
      ...baseState,
      hasDismissedServerCompatNotice: true,
    });
  });
});
