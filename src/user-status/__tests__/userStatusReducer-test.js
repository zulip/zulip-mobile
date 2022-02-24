/* @flow strict-local */
import Immutable from 'immutable';

import { makeUserId } from '../../api/idTypes';
import type { UserStatusState } from '../../types';
import * as eg from '../../__tests__/lib/exampleData';
import { EVENT_USER_STATUS_UPDATE } from '../../actionConstants';
import userStatusReducer from '../userStatusReducer';

describe('userStatusReducer', () => {
  const testUserStatusState: UserStatusState = Immutable.Map([
    [makeUserId(1), { away: true }],
    [makeUserId(2), { status_text: 'Hello, world' }],
  ]);

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      expect(userStatusReducer(testUserStatusState, eg.action.account_switch)).toEqual(
        Immutable.Map(),
      );
    });
  });

  describe('REGISTER_COMPLETE', () => {
    test('when `user_status` data is provided init state with it', () => {
      expect(
        userStatusReducer(
          Immutable.Map(),
          eg.mkActionRegisterComplete({
            user_status: { '1': { away: true }, '2': { status_text: 'Hello, world' } },
          }),
        ),
      ).toEqual(testUserStatusState);
    });

    test('handles older back-ends that do not have `user_status` data by resetting the state', () => {
      expect(
        userStatusReducer(
          testUserStatusState,
          eg.mkActionRegisterComplete({ user_status: undefined }),
        ),
      ).toEqual(Immutable.Map());
    });
  });

  describe('EVENT_USER_STATUS_UPDATE', () => {
    const mkAction = (update, userId = eg.selfUser.user_id) => ({
      id: 0,
      type: EVENT_USER_STATUS_UPDATE,
      user_id: userId,
      ...update,
    });

    test('when the user does not already have entry add a key by their `user_id`', () => {
      expect(
        userStatusReducer(
          Immutable.Map([[eg.selfUser.user_id, { away: true }]]),
          mkAction({ away: true }, eg.otherUser.user_id),
        ),
      ).toEqual(
        Immutable.Map([
          [eg.selfUser.user_id, { away: true }],
          [eg.otherUser.user_id, { away: true }],
        ]),
      );
    });

    test('if the user already has user status stored update their key', () => {
      expect(
        userStatusReducer(
          Immutable.Map([[eg.selfUser.user_id, { status_text: 'foo' }]]),
          mkAction({ status_text: 'bar' }),
        ),
      ).toEqual(Immutable.Map([[eg.selfUser.user_id, { status_text: 'bar' }]]));
    });

    test('when the user_ status text is updated this is reflected in the state', () => {
      expect(
        userStatusReducer(Immutable.Map(), mkAction({ status_text: 'Hello, world!' })),
      ).toEqual(Immutable.Map([[eg.selfUser.user_id, { status_text: 'Hello, world!' }]]));
    });

    test('both `away` and `status_text` values can be updated in one event', () => {
      expect(
        userStatusReducer(
          Immutable.Map([[eg.selfUser.user_id, {}]]),
          mkAction({ away: true, status_text: 'Hello, world!' }),
        ),
      ).toEqual(
        Immutable.Map([[eg.selfUser.user_id, { away: true, status_text: 'Hello, world!' }]]),
      );
    });

    test('if `away` status is removed delete the key from the object', () => {
      expect(
        userStatusReducer(
          Immutable.Map([[eg.selfUser.user_id, { away: true }]]),
          mkAction({ away: false }),
        ),
      ).toEqual(Immutable.Map([[eg.selfUser.user_id, {}]]));
    });

    test('if `status_text` is removed delete the key from the object', () => {
      expect(
        userStatusReducer(
          Immutable.Map([[eg.selfUser.user_id, { status_text: 'Hello, world!' }]]),
          mkAction({ status_text: '' }),
        ),
      ).toEqual(Immutable.Map([[eg.selfUser.user_id, {}]]));
    });
  });
});
