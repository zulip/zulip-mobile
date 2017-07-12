import { INIT_USERS, EVENT_USER_ADD, ACCOUNT_SWITCH } from '../../actionConstants';
import usersReducers from '../usersReducers';

describe('usersReducers', () => {
  test('handles unknown action and no state by returning initial state', () => {
    const newState = usersReducers(undefined, {});
    expect(newState).toBeDefined();
  });

  test('on unrecognized action, returns input state unchanged', () => {
    const prevState = { hello: 'world' };
    const newState = usersReducers(prevState, {});
    expect(newState).toEqual(prevState);
  });

  describe('INIT_USERS', () => {
    test('stores user data', () => {
      const users = [{ full_name: 'user1' }, { full_name: 'user2' }];
      const newState = usersReducers([], { type: INIT_USERS, users });
      expect(newState.length).toEqual(2);
    });
  });

  describe('EVENT_USER_ADD', () => {
    test('flags from all messages are extracted and stored by id', () => {
      const initialState = [];
      const action = {
        type: EVENT_USER_ADD,
        person: {
          user_id: 1,
          email: 'john@example.com',
          full_name: 'John Doe',
        },
      };
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
      const initialState = [
        {
          full_name: 'Some Guy',
          email: 'email@example.com',
          status: 'offline',
        },
      ];
      const action = {
        type: ACCOUNT_SWITCH,
      };
      const expectedState = [];

      const actualState = usersReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
