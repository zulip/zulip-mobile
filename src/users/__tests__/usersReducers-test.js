import deepFreeze from 'deep-freeze';

import { REALM_INIT, EVENT_USER_ADD, ACCOUNT_SWITCH } from '../../actionConstants';
import usersReducers from '../usersReducers';

describe('usersReducers', () => {
  test('handles unknown action and no state by returning initial state', () => {
    const initialState = undefined;

    const action = deepFreeze({});

    const newState = usersReducers(initialState, action);
    expect(newState).toBeDefined();
  });

  test('on unrecognized action, returns input state unchanged', () => {
    const initialState = deepFreeze({ hello: 'world' });

    const action = deepFreeze({});

    const newState = usersReducers(initialState, action);
    expect(newState).toBe(initialState);
  });

  describe('REALM_INIT', () => {
    test('when `users` data is provided init state with it', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: REALM_INIT,
        data: {
          realm_users: [
            {
              user_id: 1,
              email: 'john@example.com',
              full_name: 'John Doe',
            },
          ],
        },
      });

      const actualState = usersReducers(initialState, action);

      expect(actualState).toEqual([
        {
          user_id: 1,
          email: 'john@example.com',
          full_name: 'John Doe',
        },
      ]);
    });

    test('when no `users` data is given reset state', () => {
      const initialState = deepFreeze([
        {
          user_id: 1,
          email: 'john@example.com',
          full_name: 'John Doe',
        },
      ]);
      const action = deepFreeze({
        type: REALM_INIT,
        data: {},
      });
      const expectedState = [];

      const actualState = usersReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_ADD', () => {
    test('flags from all messages are extracted and stored by id', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_USER_ADD,
        person: {
          user_id: 1,
          email: 'john@example.com',
          full_name: 'John Doe',
        },
      });

      const expectedState = [
        {
          user_id: 1,
          email: 'john@example.com',
          full_name: 'John Doe',
        },
      ];

      const actualState = usersReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'offline',
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = usersReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
