/* @flow strict-local */
import {
  getAllUsersByEmail,
  getAllUsersById,
  getUsersById,
  getUserForId,
  getUserIsActive,
  getCustomProfileFieldsForUser,
} from '../userSelectors';
import * as eg from '../../__tests__/lib/exampleData';
import { CustomProfileFieldType } from '../../api/modelTypes';
import { randInt, randString } from '../../utils/misc';

describe('getAllUsersByEmail', () => {
  test('return users mapped by their email', () => {
    const users = [eg.makeUser(), eg.makeUser(), eg.makeUser()];
    const state = eg.reduxState({ users });
    expect(getAllUsersByEmail(state)).toEqual(new Map(users.map(u => [u.email, u])));
  });

  test('return users, bots, and inactive users mapped by their email', () => {
    const state = eg.reduxState({
      users: [eg.selfUser],
      realm: {
        ...eg.baseReduxState.realm,
        crossRealmBots: [eg.crossRealmBot],
        nonActiveUsers: [eg.otherUser],
      },
    });
    expect(getAllUsersByEmail(state)).toEqual(
      new Map([
        [eg.selfUser.email, eg.selfUser],
        [eg.crossRealmBot.email, eg.crossRealmBot],
        [eg.otherUser.email, eg.otherUser],
      ]),
    );
  });

  test('empty state does not cause an exception, returns an empty object', () => {
    expect(getAllUsersByEmail(eg.reduxState())).toEqual(new Map());
  });
});

describe('getAllUsersById', () => {
  test('return users mapped by their id', () => {
    const users = [eg.makeUser(), eg.makeUser(), eg.makeUser()];
    const state = eg.reduxState({ users });
    expect(getAllUsersById(state)).toEqual(new Map(users.map(u => [u.user_id, u])));
  });

  test('return users, bots, and inactive users mapped by their id', () => {
    const state = eg.reduxState({
      users: [eg.selfUser],
      realm: {
        ...eg.baseReduxState.realm,
        crossRealmBots: [eg.crossRealmBot],
        nonActiveUsers: [eg.otherUser],
      },
    });
    expect(getAllUsersById(state)).toEqual(
      new Map([
        [eg.selfUser.user_id, eg.selfUser],
        [eg.crossRealmBot.user_id, eg.crossRealmBot],
        [eg.otherUser.user_id, eg.otherUser],
      ]),
    );
  });

  test('empty state does not cause an exception, returns an empty object', () => {
    expect(getAllUsersById(eg.reduxState())).toEqual(new Map());
  });
});

describe('getUsersById', () => {
  test('return users mapped by their Id', () => {
    const users = [eg.makeUser(), eg.makeUser(), eg.makeUser()];
    const state = eg.reduxState({ users });
    expect(getUsersById(state)).toEqual(new Map(users.map(u => [u.user_id, u])));
  });
});

describe('getUserForId', () => {
  const state = eg.reduxState({
    users: [eg.selfUser],
    realm: {
      ...eg.baseReduxState.realm,
      crossRealmBots: [eg.crossRealmBot],
      nonActiveUsers: [eg.makeUser(), eg.makeUser()],
    },
  });

  test('returns the user if it has not been deactivated', () => {
    expect(getUserForId(state, state.users[0].user_id)).toEqual(state.users[0]);
  });

  test('returns the user if it has been deactivated', () => {
    expect(getUserForId(state, state.realm.nonActiveUsers[0].user_id)).toEqual(
      state.realm.nonActiveUsers[0],
    );
  });

  test('returns the user if it is a cross realm bot', () => {
    expect(getUserForId(state, state.realm.crossRealmBots[0].user_id)).toEqual(
      state.realm.crossRealmBots[0],
    );
  });
});

describe('getUserIsActive', () => {
  const state = eg.reduxState({
    users: [eg.selfUser],
    realm: {
      ...eg.baseReduxState.realm,
      crossRealmBots: [eg.crossRealmBot],
      nonActiveUsers: [eg.makeUser(), eg.makeUser()],
    },
  });

  test('returns false for a user that has been deactivated', () => {
    expect(getUserIsActive(state, state.realm.nonActiveUsers[0].user_id)).toBeFalse();
  });

  test('returns true for a user that has not been deactivated', () => {
    expect(getUserIsActive(state, state.users[0].user_id)).toBeTrue();
  });

  test('returns true for a cross realm bot', () => {
    expect(getUserIsActive(state, state.realm.crossRealmBots[0].user_id)).toBeTrue();
  });
});

describe('getCustomProfileFieldsForUser', () => {
  const mkRealm = (fields, defaultExternalAccounts) =>
    eg.realmState({
      customProfileFields: fields.map((f, i) => ({ order: i, hint: '', field_data: '', ...f })),
      ...(defaultExternalAccounts == null ? null : { defaultExternalAccounts }),
    });
  const mkUser = fields => ({ ...eg.otherUser, profile_data: fields });

  describe('by field type', () => {
    /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkOne"] }] */
    function checkOne(realmField, value, expectedValue, defaultExternalAccounts) {
      const fieldId = randInt(1000);
      const name = randString();
      expect(
        getCustomProfileFieldsForUser(
          mkRealm([{ id: fieldId, name, ...realmField }], defaultExternalAccounts),
          mkUser({ [fieldId]: { value } }),
        ),
      ).toEqual([{ fieldId, name, value: expectedValue }]);
    }

    test('ShortText', () => {
      const text = 'hello';
      checkOne({ type: CustomProfileFieldType.ShortText }, text, { displayType: 'text', text });
    });

    test('LongText', () => {
      const text = 'hello hello';
      checkOne({ type: CustomProfileFieldType.LongText }, text, { displayType: 'text', text });
    });

    test('Choice', () => {
      const text = 'Foo text';
      checkOne(
        { type: CustomProfileFieldType.Choice, field_data: JSON.stringify({ foo: { text } }) },
        'foo',
        { displayType: 'text', text },
      );
    });

    test('Date', () => {
      const value = '2022-06-03';
      checkOne({ type: CustomProfileFieldType.Date }, value, { displayType: 'text', text: value });
    });

    test('Link', () => {
      const url = 'https://example.com/';
      checkOne({ type: CustomProfileFieldType.Link }, url, {
        displayType: 'link',
        text: url,
        url: new URL(url),
      });
    });

    test('ExternalAccount, of a default subtype', () => {
      const subtype = 'github';
      const username = 'exampleuser';
      const url_pattern = 'https://github.com/%(username)s';
      checkOne(
        { type: CustomProfileFieldType.ExternalAccount, field_data: JSON.stringify({ subtype }) },
        username,
        { displayType: 'link', text: username, url: new URL(`https://github.com/${username}`) },
        new Map([[subtype, { url_pattern }]]),
      );
    });

    test('ExternalAccount, subtype custom', () => {
      const username = 'exampleuser';
      const url_pattern = 'https://example.com/u/%(username)s';
      checkOne(
        {
          type: CustomProfileFieldType.ExternalAccount,
          field_data: JSON.stringify({ subtype: 'custom', url_pattern }),
        },
        username,
        { displayType: 'link', text: username, url: new URL(`https://example.com/u/${username}`) },
      );
    });

    test('User, empty list', () => {
      checkOne({ type: CustomProfileFieldType.User }, JSON.stringify([]), {
        displayType: 'users',
        userIds: [],
      });
    });

    test('User, single', () => {
      const userIds = [eg.thirdUser].map(u => u.user_id);
      checkOne({ type: CustomProfileFieldType.User }, JSON.stringify(userIds), {
        displayType: 'users',
        userIds,
      });
    });

    test('User, multiple', () => {
      const userIds = [eg.selfUser, eg.otherUser, eg.thirdUser].map(u => u.user_id);
      checkOne({ type: CustomProfileFieldType.User }, JSON.stringify(userIds), {
        displayType: 'users',
        userIds,
      });
    });
  });

  test('use order from realm list, not IDs', () => {
    expect(
      getCustomProfileFieldsForUser(
        mkRealm([
          { id: 2, name: 'name two', type: CustomProfileFieldType.ShortText },
          { id: 1, name: 'name one', type: CustomProfileFieldType.ShortText },
        ]),
        mkUser({ '1': { value: 'value one' }, '2': { value: 'value two' } }),
      ),
    ).toEqual([
      { fieldId: 2, name: 'name two', value: { displayType: 'text', text: 'value two' } },
      { fieldId: 1, name: 'name one', value: { displayType: 'text', text: 'value one' } },
    ]);
  });

  test('omit unset fields', () => {
    expect(
      getCustomProfileFieldsForUser(
        mkRealm([
          { id: 1, name: 'name one', type: CustomProfileFieldType.ShortText },
          { id: 2, name: 'name two', type: CustomProfileFieldType.ShortText },
          { id: 3, name: 'name three', type: CustomProfileFieldType.ShortText },
        ]),
        mkUser({ '1': { value: 'value one' }, '3': { value: 'value three' } }),
      ),
    ).toMatchObject([{ fieldId: 1 }, { fieldId: 3 }]);
  });
});
