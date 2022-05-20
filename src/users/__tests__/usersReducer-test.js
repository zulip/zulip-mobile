/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import { UploadedAvatarURL } from '../../utils/avatar';
import { EVENT_USER_ADD, ACCOUNT_SWITCH, EVENT } from '../../actionConstants';
import { EventTypes, type RealmUserUpdateEvent } from '../../api/eventTypes';
import { RoleValues } from '../../api/permissionsTypes';
import usersReducer from '../usersReducer';
import { randString } from '../../utils/misc';

describe('usersReducer', () => {
  describe('REGISTER_COMPLETE', () => {
    const user1 = eg.makeUser();

    test('when `users` data is provided init state with it', () => {
      const prevState = deepFreeze([]);

      const action = eg.mkActionRegisterComplete({
        realm_users: [user1],
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

  describe('EVENT > realm_user > update', () => {
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
    const check = <P: $PropertyType<RealmUserUpdateEvent, 'person'>>(
      personMaybeWithoutId: $Rest<P, {| user_id?: mixed |}>,
    ) => {
      const person: P = { user_id: theUser.user_id, ...personMaybeWithoutId };

      const action = deepFreeze({
        type: EVENT,
        event: { id: 1, type: EventTypes.realm_user, op: 'update', person },
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

    test.skip('When a user changes their full name.', () => {
      check({ full_name: randString() });
    });

    test('When a user changes their avatar.', () => {
      check({
        avatar_url: UploadedAvatarURL.validateAndConstructInstance({
          realm: new URL('https://zulip.example.org'),
          absoluteOrRelativeUrl: `/yo/avatar-${randString()}.png`,
        }),
        // avatar_source: user1.avatar_source === 'G' ? 'U' : 'G',
        // avatar_url_medium: randString(),
        // avatar_version: user1.avatar_version + 1,
      });
    });

    test.skip('When a user changes their timezone setting.', () => {
      check({ timezone: randString() });
    });

    test.skip('When the owner of a bot changes.', () => {
      check({ bot_owner_id: (theUser.bot_owner_id ?? 1) + 1 });
    });

    test('When the role of a user changes.', () => {
      check({ role: RoleValues[(RoleValues.indexOf(theUser.role) + 1) % RoleValues.length] });
    });

    test.skip("When a user's billing-admin status changes", () => {
      check({ is_billing_admin: !theUser.is_billing_admin });
    });

    test.skip('When the delivery email of a user changes.', () => {
      check({ delivery_email: randString() });
    });

    test.skip('When the user updates one of their custom profile fields.', () => {
      check({
        custom_profile_field: { id: 4, value: randString(), rendered_value: randString() },
      });
    });

    test.skip('When the Zulip display email address of a user changes', () => {
      check({ new_email: randString() });
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
