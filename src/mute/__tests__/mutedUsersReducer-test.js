/* @flow strict-local */
import Immutable from 'immutable';
import deepFreeze from 'deep-freeze';

import mutedUsersReducer from '../mutedUsersReducer';
import { makeUserId } from '../../api/idTypes';
import * as eg from '../../__tests__/lib/exampleData';

describe('mutedUsersReducer', () => {
  const baseState = Immutable.Map([[makeUserId(42), 1618822632]]);

  describe('REALM_INIT', () => {
    test('when `muted_users` data is provided init state with it', () => {
      const action = deepFreeze({
        ...eg.action.realm_init,
        data: {
          ...eg.action.realm_init.data,
          muted_users: [{ id: makeUserId(42), timestamp: 1618822632 }],
        },
      });
      expect(mutedUsersReducer(eg.baseReduxState.mutedUsers, action)).toEqual(
        Immutable.Map([[makeUserId(42), 1618822632]]),
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
        ...eg.eventMutedUsersActionBase,
        muted_users: [
          { id: makeUserId(42), timestamp: 1618822632 },
          { id: makeUserId(1234), timestamp: 1618822635 },
        ],
      });

      // prettier-ignore
      expect(mutedUsersReducer(baseState, action)).toEqual(Immutable.Map([
        [makeUserId(42), 1618822632],
        [makeUserId(1234), 1618822635],
      ]));
    });
  });
});
