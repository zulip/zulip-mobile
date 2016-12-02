import {
  INIT_ROUTES,
  PUSH_ROUTE,
  POP_ROUTE,
  SET_AUTH_TYPE,
  LOGIN_SUCCESS,
} from '../../constants';
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

  describe('PUSH_ROUTE', () => {
    test('adds new route at the end of list, changes current route to point to it', () => {
      const prevState = {
        index: 0,
        routes: [
          { key: 'one' }
        ],
      };
      const action = {
        type: PUSH_ROUTE,
        route: 'another',
      };
      const expectedState = {
        index: 1,
        routes: [
          { key: 'one' },
          { key: 'another' },
        ],
      };

      const newState = navReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('POP_ROUTE', () => {
    test('removes last route in list, previous route becomes active', () => {
      const prevState = {
        index: 2,
        routes: [
          { key: 'one' },
          { key: 'two' },
          { key: 'three' },
        ],
      };
      const action = {
        type: POP_ROUTE,
      };
      const expectedState = {
        index: 1,
        routes: [
          { key: 'one' },
          { key: 'two' },
        ],
      };

      const newState = navReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('POP_ROUTE', () => {
    test('trying to pop route when list is empty, does nothing', () => {
      const prevState = {
        index: 0,
        routes: [],
      };
      const action = {
        type: POP_ROUTE,
      };

      const newState = navReducers(prevState, action);

      expect(newState).toBe(prevState);
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
    test('replaces the existing route stack with a new one pointing to "main"', () => {
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
