/* @flow strict-local */
import Immutable from 'immutable';
import deepFreeze from 'deep-freeze';

import mutedUsersReducer from '../mutedUsersReducer';
import { EVENT_MUTED_USERS } from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';

describe('mutedUsersReducer', () => {
  const baseState = Immutable.Map([[eg.otherUser.user_id, 1618822632]]);

  describe('REALM_INIT', () => {
    test('when `muted_users` data is provided init state with it', () => {
      const action = deepFreeze({
        ...eg.action.realm_init,
        data: {
          ...eg.action.realm_init.data,
          muted_users: [{ id: eg.otherUser.user_id, timestamp: 1618822632 }],
        },
      });
      expect(mutedUsersReducer(eg.baseReduxState.mutedUsers, action)).toEqual(
        Immutable.Map([[eg.otherUser.user_id, 1618822632]]),
      );
    });

    test('when no `muted_users` data is given reset state', () => {
      expect(mutedUsersReducer(baseState, eg.action.realm_init)).toEqual(Immutable.Map());
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      expect(mutedUsersReducer(baseState, eg.action.account_switch)).toEqual(Immutable.Map());
    });
  });

  describe('EVENT_MUTED_USERS', () => {
    test('update `muted_users` when event comes in', () => {
      const action = deepFreeze({
        type: EVENT_MUTED_USERS,
        id: 1234,
        muted_users: [
          { id: eg.otherUser.user_id, timestamp: 1618822632 },
          { id: eg.thirdUser.user_id, timestamp: 1618822635 },
        ],
      });

      // prettier-ignore
      expect(mutedUsersReducer(baseState, action)).toEqual(Immutable.Map([
        [eg.otherUser.user_id, 1618822632],
        [eg.thirdUser.user_id, 1618822635],
      ]));
    });
  });
});
