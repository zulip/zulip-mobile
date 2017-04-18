import {
  INIT_ROUTES,
  SET_AUTH_TYPE,
  LOGIN_SUCCESS,
} from '../../actionConstants';
import navReducers from '../navReducers';

describe('navReducers', () => {
  describe('INIT_ROUTES', () => {
    test('replaces current route stack with a new one', () => {
      const prevState = {
        index: 0,
        routes: [],
      };
      const action = {
        type: INIT_ROUTES,
        routes: ['main'],
      };
      const expectedState = {
        index: 0,
        routes: [{ key: 'main' }],
      };

      const newState = navReducers(prevState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(action.routes);
    });

    test('can init with multiple routes at once, last one becomes active', () => {
      const prevState = {
        index: 0,
        routes: [],
      };
      const action = {
        type: INIT_ROUTES,
        routes: ['first', 'second'],
      };
      const expectedState = {
        index: 1,
        routes: [
          { key: 'first' },
          { key: 'second' },
        ],
      };

      const newState = navReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('SET_AUTH_TYPE', () => {
    test('navigates to a route with the name of the auth type', () => {
      const prevState = {
        index: 1,
        routes: [
          { key: 'one' },
          { key: 'two' },
        ],
      };
      const action = {
        type: SET_AUTH_TYPE,
        authType: 'password',
      };
      const expectedState = {
        index: 2,
        routes: [
          { key: 'one' },
          { key: 'two' },
          { key: 'password' },
        ],
      };

      const newState = navReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('LOGIN_SUCCESS', () => {
    test('replaces the existing route stack with "main" on sign in', () => {
      const prevState = {
        index: 2,
        routes: [
          { key: 'one' },
          { key: 'two' },
          { key: 'password' },
        ],
      };
      const action = {
        type: LOGIN_SUCCESS,
      };
      const expectedState = {
        index: 0,
        routes: [{ key: 'main' }],
      };

      const newState = navReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
