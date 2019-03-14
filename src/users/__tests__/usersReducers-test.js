import deepFreeze from 'deep-freeze';

import {
  REALM_INIT,
  EVENT_USER_ADD,
  ACCOUNT_SWITCH,
  EVENT_USER_UPDATE,
} from '../../actionConstants';
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

  describe('EVENT_USER_UPDATE', () => {
    test('updating non existing user does not mutate state', () => {
      const initialState = deepFreeze([
        {
          user_id: 1,
          full_name: 'Some Guy',
        },
      ]);
      const action = deepFreeze({
        type: EVENT_USER_UPDATE,
        person: {
          user_id: 2,
          full_name: 'New Name',
        },
      });

      const actualState = usersReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('updating an existing user mutates state', () => {
      const initialState = deepFreeze([
        {
          user_id: 1,
          full_name: 'Some Guy',
        },
      ]);
      const action = deepFreeze({
        type: EVENT_USER_UPDATE,
        person: {
          user_id: 1,
          full_name: 'New Name',
        },
      });
      const expectedState = [
        {
          user_id: 1,
          full_name: 'New Name',
        },
      ];

      const actualState = usersReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('updating existing user with the same values does not mutate state', () => {
      const initialState = deepFreeze([
        {
          user_id: 1,
          full_name: 'Some Guy',
        },
      ]);
      const action = deepFreeze({
        type: EVENT_USER_UPDATE,
        person: {
          user_id: 1,
          full_name: 'Some Guy',
        },
      });

      const actualState = usersReducers(initialState, action);

      expect(actualState).toBe(initialState);
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
