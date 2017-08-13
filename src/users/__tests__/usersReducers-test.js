import deepFreeze from 'deep-freeze';

import { INIT_USERS, EVENT_USER_ADD, ACCOUNT_SWITCH } from '../../actionConstants';
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

  describe('INIT_USERS', () => {
    test('stores user data', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: INIT_USERS,
        users: [{ full_name: 'user1' }, { full_name: 'user2' }],
      });

      const newState = usersReducers(initialState, action);
      expect(newState.length).toEqual(2);
    });

    test('when same users data already exists in state, do not change state', () => {
      const initialState = deepFreeze([
        {
          id: 1,
          email: 'xyz@example.com',
          fullName: 'Some Guy',
          avatarUrl: 'http://example.com',
          isActive: true,
          isAdmin: true,
          isBot: false,
        },
      ]);

      const action = deepFreeze({
        type: INIT_USERS,
        users: [
          {
            user_id: 1,
            email: 'xyz@example.com',
            full_name: 'Some Guy',
            avatar_url: 'http://example.com',
            is_active: true,
            is_admin: true,
            is_bot: false,
          },
        ],
      });

      const newState = usersReducers(initialState, action);

      expect(newState).toBe(initialState);
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
          id: 1,
          email: 'john@example.com',
          fullName: 'John Doe',
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
