/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import { CANCEL_EDIT_MESSAGE, START_EDIT_MESSAGE } from '../../actionConstants';
import sessionReducer from '../sessionReducer';
import * as eg from '../../__tests__/exampleData';

describe('sessionReducer', () => {
  const baseState = eg.baseReduxState.session;

  test('ACCOUNT_SWITCH', () => {
    const newState = sessionReducer(baseState, eg.action.account_switch);
    expect(newState).toEqual({ ...baseState, needsInitialFetch: true });
  });

  test('START_EDIT_MESSAGE', () => {
    const action = deepFreeze({
      type: START_EDIT_MESSAGE,
      messageId: 12,
      message: 'test',
      topic: 'test topic',
    });
    expect(sessionReducer(baseState, action)).toEqual({
      ...baseState,
      editMessage: { id: 12, content: 'test', topic: 'test topic' },
    });
  });

  test('CANCEL_EDIT_MESSAGE', () => {
    const state = deepFreeze({
      ...baseState,
      editMessage: { id: 12, content: 'test', topic: 'test topic' },
    });
    expect(sessionReducer(state, deepFreeze({ type: CANCEL_EDIT_MESSAGE }))).toEqual(baseState);
  });

  test('LOGIN_SUCCESS', () => {
    const newState = sessionReducer(baseState, eg.action.login_success);
    expect(newState).toEqual({ ...baseState, needsInitialFetch: true });
  });
});
