import deepFreeze from 'deep-freeze';

import { REALM_INIT, EVENT_USER_ADD, ACCOUNT_SWITCH } from '../../actionConstants';
import usersReducer from '../usersReducer';

describe('usersReducer', () => {
  test('handles unknown action and no state by returning initial state', () => {
    const prevState = undefined;

    const action = deepFreeze({});

    const newState = usersReducer(prevState, action);
    expect(newState).toBeDefined();
  });

  test('on unrecognized action, returns input state unchanged', () => {
    const prevState = deepFreeze({ hello: 'world' });

    const action = deepFreeze({});

    const newState = usersReducer(prevState, action);
    expect(newState).toBe(prevState);
  });

  describe('REALM_INIT', () => {
    test('when `users` data is provided init state with it', () => {
      const prevState = deepFreeze([]);
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

      const actualState = usersReducer(prevState, action);

      expect(actualState).toEqual([
        {
          user_id: 1,
          email: 'john@example.com',
          full_name: 'John Doe',
        },
      ]);
    });

    test('when no `users` data is given reset state', () => {
      const prevState = deepFreeze([
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

      const actualState = usersReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_ADD', () => {
    test('flags from all messages are extracted and stored by id', () => {
      const prevState = deepFreeze([]);

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

      const actualState = usersReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const prevState = deepFreeze([
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

      const actualState = usersReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
