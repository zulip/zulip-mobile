/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import loadingReducers from '../loadingReducers';
import { ACCOUNT_SWITCH, LOADING_START, LOADING_COMPLETE } from '../../actionConstants';

describe('loadingReducers', () => {
  describe('LOADING_START', () => {
    test('sets the key specified in `entity` to true', () => {
      const initialState = deepFreeze({
        presence: false,
        subscriptions: false,
        streams: false,
        unread: false,
        users: false,
      });

      const action = deepFreeze({
        type: LOADING_START,
        entity: 'users',
      });

      const expectedState = {
        presence: false,
        subscriptions: false,
        streams: false,
        unread: false,
        users: true,
      };

      const actualState = loadingReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('LOADING_COMPLETE', () => {
    test('sets the key specified in `entity` to false', () => {
      const initialState = deepFreeze({
        presence: true,
        subscriptions: true,
        streams: true,
        unread: true,
        users: true,
      });

      const action = deepFreeze({
        type: LOADING_COMPLETE,
        entity: 'users',
      });

      const expectedState = {
        presence: true,
        subscriptions: true,
        streams: true,
        unread: true,
        users: false,
      };

      const actualState = loadingReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to nothing is loading', () => {
      const initialState = deepFreeze({
        presence: true,
        subscriptions: true,
        streams: true,
        unread: true,
        users: true,
      });

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = {
        presence: false,
        subscriptions: false,
        streams: false,
        unread: false,
        users: false,
      };

      const actualState = loadingReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
