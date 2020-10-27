import deepFreeze from 'deep-freeze';

import { REALM_INIT, EVENT_USER_ADD, ACCOUNT_SWITCH } from '../../actionConstants';
import usersReducer from '../usersReducer';

describe('usersReducer', () => {
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
