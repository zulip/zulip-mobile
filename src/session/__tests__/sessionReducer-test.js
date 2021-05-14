/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import {
  DEAD_QUEUE,
  LOGOUT,
  APP_ONLINE,
  INITIAL_FETCH_COMPLETE,
  APP_ORIENTATION,
  GOT_PUSH_TOKEN,
  TOGGLE_OUTBOX_SENDING,
  DEBUG_FLAG_TOGGLE,
  DISMISS_SERVER_COMPAT_NOTICE,
  INITIAL_FETCH_START,
} from '../../actionConstants';
import sessionReducer from '../sessionReducer';
import * as eg from '../../__tests__/lib/exampleData';

describe('sessionReducer', () => {
  const baseState = eg.baseReduxState.session;

  test('ACCOUNT_SWITCH', () => {
    const state = deepFreeze({
      ...baseState,
      needsInitialFetch: false,
      loading: true,
    });
    const newState = sessionReducer(state, eg.action.account_switch);
    expect(newState).toEqual({
      ...baseState,
      needsInitialFetch: true,
      loading: false,
    });
  });

  test('LOGIN_SUCCESS', () => {
    const newState = sessionReducer(baseState, eg.action.login_success);
    expect(newState).toEqual({ ...baseState, needsInitialFetch: true });
  });

  test('DEAD_QUEUE', () => {
    const state = deepFreeze({ ...baseState, needsInitialFetch: false, loading: true });
    const newState = sessionReducer(state, deepFreeze({ type: DEAD_QUEUE }));
    expect(newState).toEqual({ ...baseState, needsInitialFetch: true, loading: false });
  });

  test('LOGOUT', () => {
    const state = deepFreeze({
      ...baseState,
      needsInitialFetch: true,
      loading: true,
    });
    const newState = sessionReducer(state, deepFreeze({ type: LOGOUT }));
    expect(newState).toEqual({
      ...baseState,
      needsInitialFetch: false,
      loading: false,
    });
  });

  test('REALM_INIT', () => {
    const action = deepFreeze({
      ...eg.action.realm_init,
      data: { ...eg.action.realm_init.data, queue_id: 100 },
    });
    const newState = sessionReducer(baseState, action);
    expect(newState).toEqual({ ...baseState, eventQueueId: 100 });
  });

  test('APP_ONLINE', () => {
    const state = deepFreeze({ ...baseState, isOnline: false });
    const action = deepFreeze({ type: APP_ONLINE, isOnline: true });
    const newState = sessionReducer(state, action);
    expect(newState).toEqual({ ...baseState, isOnline: true });
  });

  test('INITIAL_FETCH_COMPLETE', () => {
    const state = deepFreeze({ ...baseState, needsInitialFetch: true, loading: true });
    const newState = sessionReducer(state, deepFreeze({ type: INITIAL_FETCH_COMPLETE }));
    expect(newState).toEqual({ ...baseState, needsInitialFetch: false, loading: false });
  });

  test('INITIAL_FETCH_START', () => {
    const state = deepFreeze({ ...baseState, loading: false });
    const newState = sessionReducer(state, deepFreeze({ type: INITIAL_FETCH_START }));
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

  test('DEBUG_FLAG_TOGGLE', () => {
    const action = deepFreeze({ type: DEBUG_FLAG_TOGGLE, key: 'someKey', value: true });
    expect(sessionReducer(baseState, action)).toEqual({
      ...baseState,
      debug: { doNotMarkMessagesAsRead: false, someKey: true },
    });
  });

  test('DISMISS_SERVER_COMPAT_NOTICE', () => {
    const action = deepFreeze({ type: DISMISS_SERVER_COMPAT_NOTICE });
    expect(sessionReducer(baseState, action)).toEqual({
      ...baseState,
      hasDismissedServerCompatNotice: true,
    });
  });
});
