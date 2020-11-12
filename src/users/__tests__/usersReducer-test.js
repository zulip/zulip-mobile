/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import { EVENT_USER_ADD, ACCOUNT_SWITCH } from '../../actionConstants';
import usersReducer from '../usersReducer';

describe('usersReducer', () => {
  describe('REALM_INIT', () => {
    const user1 = eg.makeUser();

    test('when `users` data is provided init state with it', () => {
      const prevState = deepFreeze([]);

      const action = deepFreeze({
        ...eg.action.realm_init,
        data: {
          ...eg.action.realm_init.data,
          realm_users: [user1],
        },
      });

      const actualState = usersReducer(prevState, action);

      expect(actualState).toEqual([user1]);
    });
  });

  describe('EVENT_USER_ADD', () => {
    const user1 = eg.makeUser();

    test('flags from all messages are extracted and stored by id', () => {
      const prevState = deepFreeze([]);

      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_ADD,
        person: user1,
      });

      const expectedState = [user1];

      const actualState = usersReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    const user1 = eg.makeUser();

    test('resets state to initial state', () => {
      const prevState = deepFreeze([user1]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 2,
      });

      const expectedState = [];

      const actualState = usersReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
