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
  REGISTER_PUSH_TOKEN_START,
  REGISTER_PUSH_TOKEN_END,
} from '../../actionConstants';
import sessionReducer, { initialPerAccountSessionState } from '../sessionReducer';
import * as eg from '../../__tests__/lib/exampleData';
import { identityOfAccount } from '../../account/accountMisc';

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

  test('REGISTER_PUSH_TOKEN_START / REGISTER_PUSH_TOKEN_END increment/decrement counter', () => {
    const run = (state, type, account) =>
      sessionReducer(
        state,
        type === 'start'
          ? { type: REGISTER_PUSH_TOKEN_START, identity: identityOfAccount(account) }
          : { type: REGISTER_PUSH_TOKEN_END, identity: identityOfAccount(account) },
        eg.plusReduxState,
      );

    const state1 = run(baseState, 'start', eg.selfAccount);
    expect(state1.registerPushTokenRequestsInProgress).toEqual(1);

    const state2 = run(state1, 'start', eg.selfAccount);
    expect(state2.registerPushTokenRequestsInProgress).toEqual(2);

    const state3 = run(state2, 'end', eg.selfAccount);
    expect(state3.registerPushTokenRequestsInProgress).toEqual(1);

    const state4 = run(state3, 'end', eg.selfAccount);
    expect(state4.registerPushTokenRequestsInProgress).toEqual(0);

    const state5 = run(state4, 'start', eg.makeAccount());
    expect(state5).toBe(state4);

    const state7 = run(state5, 'end', eg.makeAccount());
    expect(state7).toBe(state5);
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
