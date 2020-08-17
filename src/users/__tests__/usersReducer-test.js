/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import type { User } from '../../types';
import { EVENT_USER_ADD, EVENT_USER_UPDATE, ACCOUNT_SWITCH } from '../../actionConstants';
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

  describe('EVENT_USER_UPDATE', () => {
    const theUser = eg.makeUser();
    const prevState = deepFreeze([theUser]);

    /**
     * Check that an update event with supplied `person` works.
     *
     * May omit `user_id` to avoid repetition.
     */
    // Tell ESLint to recognize `check` as a helper function that runs
    // assertions.
    /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "check"] }] */
    const check = (personMaybeWithoutId: $Shape<User>) => {
      const person = {
        user_id: theUser.user_id,
        ...personMaybeWithoutId,
      };
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_UPDATE,
        userId: person.user_id,
        person,
      });

      expect(usersReducer(prevState, action)).toEqual([{ ...theUser, ...person }]);
    };

    /*
     * Should match REALM_USER OP: UPDATE in the doc.
     *
     * See https://zulip.com/api/get-events#realm_user-update.
     *
     * A few properties that we don't handle are commented out.
     */

    test('When a user changes their full name.', () => {
      check({ full_name: eg.randString() });
    });

    test('When a user changes their avatar.', () => {
      check({
        avatar_url: eg.randString(),
        // avatar_source: user1.avatar_source === 'G' ? 'U' : 'G',
        // avatar_url_medium: eg.randString(),
        // avatar_version: user1.avatar_version + 1,
      });
    });

    test('When a user changes their timezone setting.', () => {
      check({ timezone: eg.randString() });
    });

    // Excluded: "When the owner of a bot changes." The `users` state
    // doesn't include cross-realm bots.

    test('When the role of a user changes.', () => {
      check({
        // role: user1.role + 1,
      });
    });

    test('When the delivery email of a user changes.', () => {
      check({
        // delivery_email: eg.randString(),
      });
    });

    test('When the user updates one of their custom profile fields.', () => {
      check({
        // custom_profile_field: {
        //   id: 4,
        //   value: eg.randString(),
        //   rendered_value: eg.randString(),
        // },
      });
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
