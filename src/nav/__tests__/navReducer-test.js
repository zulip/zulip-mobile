import deepFreeze from 'deep-freeze';

import { LOGIN_SUCCESS, INITIAL_FETCH_COMPLETE, REHYDRATE } from '../../actionConstants';
import navReducer, {
  getStateForRoute,
  initialState as initialNavigationState,
} from '../navReducer';

describe('navReducer', () => {
  const initialState = deepFreeze(initialNavigationState);

  describe('LOGIN_SUCCESS', () => {
    test('replaces the existing route stack with "loading" on sign in', () => {
      const prevState = deepFreeze({
        index: 2,
        routes: [{ key: 'one' }, { key: 'two' }, { key: 'password' }],
      });

      const action = deepFreeze({
        type: LOGIN_SUCCESS,
      });

      const expectedState = {
        index: 0,
        routes: [{ routeName: 'loading' }],
      };

      const newState = navReducer(prevState, action);

      expect(newState.index).toEqual(expectedState.index);
      expect(newState.routes[0].routeName).toEqual(expectedState.routes[0].routeName);
    });
  });

  describe('INITIAL_FETCH_COMPLETE', () => {
    test('do not mutate navigation state if already at the same route', () => {
      const prevState = getStateForRoute('main');

      const action = deepFreeze({
        type: INITIAL_FETCH_COMPLETE,
      });

      const newState = navReducer(prevState, action);

      expect(newState).toBe(prevState);
    });
  });

  describe('REHYDRATE', () => {
    test('when no previous navigation is given do not throw but return some result', () => {
      const action = deepFreeze({
        type: REHYDRATE,
        payload: {
          accounts: [{ apiKey: '123' }],
          users: [],
          realm: {},
        },
      });

      const nav = navReducer(initialState, action);

      expect(nav.routes).toHaveLength(1);
    });

    test('if logged in and users is empty, go to loading', () => {
      const action = deepFreeze({
        type: REHYDRATE,
        payload: {
          accounts: [{ apiKey: '123' }],
          users: [],
          realm: {},
        },
      });

      const nav = navReducer(initialState, action);

      expect(nav.routes).toHaveLength(1);
      expect(nav.routes[0].routeName).toEqual('loading');
    });

    test('if logged in and users is not empty, go to main', () => {
      const action = deepFreeze({
        type: REHYDRATE,
        payload: {
          accounts: [{ apiKey: '123' }],
          users: [{ user_id: 123 }],
          realm: {},
        },
      });

      const nav = navReducer(initialState, action);

      expect(nav.routes).toHaveLength(1);
      expect(nav.routes[0].routeName).toEqual('main');
    });

    test('if not logged in, and no previous accounts, show login screen', () => {
      const action = deepFreeze({
        type: REHYDRATE,
        payload: {
          accounts: [],
          users: [],
          realm: {},
        },
      });

      const nav = navReducer(initialState, action);

      expect(nav.routes).toHaveLength(1);
      expect(nav.routes[0].routeName).toEqual('realm');
    });

    test('if more than one account and no active account, display account list', () => {
      const action = deepFreeze({
        type: REHYDRATE,
        payload: {
          accounts: [{ apiKey: '' }, { apiKey: '' }],
          users: [],
          realm: {},
        },
      });

      const nav = navReducer(initialState, action);

      expect(nav.routes).toHaveLength(1);
      expect(nav.routes[0].routeName).toEqual('account');
    });

    test('when only a single account and no other properties, redirect to login screen', () => {
      const action = deepFreeze({
        type: REHYDRATE,
        payload: {
          accounts: [{ apiKey: '', realm: 'https://example.com' }],
          users: [],
          realm: {},
        },
      });

      const nav = navReducer(initialState, action);

      expect(nav.routes).toHaveLength(1);
      expect(nav.routes[0].routeName).toEqual('realm');
    });

    test('when multiple accounts and default one has realm and email, show account list', () => {
      const action = deepFreeze({
        type: REHYDRATE,
        payload: {
          accounts: [
            { apiKey: '', realm: 'https://example.com', email: 'johndoe@example.com' },
            { apiKey: '', realm: 'https://example.com', email: 'janedoe@example.com' },
          ],
          users: [],
          realm: {},
        },
      });

      const nav = navReducer(initialState, action);

      expect(nav.routes).toHaveLength(1);
      expect(nav.routes[0].routeName).toEqual('account');
    });

    test('when default account has server and email set, redirect to login screen', () => {
      const action = deepFreeze({
        type: REHYDRATE,
        payload: {
          accounts: [{ apiKey: '', realm: 'https://example.com', email: 'johndoe@example.com' }],
          users: [],
          realm: {},
        },
      });

      const nav = navReducer(initialState, action);

      expect(nav.routes).toHaveLength(1);
      expect(nav.routes[0].routeName).toEqual('realm');
    });
  });
});
