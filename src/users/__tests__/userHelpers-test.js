/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import Immutable from 'immutable';

import {
  sortUserList,
  filterUserList,
  getAutocompleteSuggestion,
  getAutocompleteUserGroupSuggestions,
  filterUserStartWith,
  filterUserThatContains,
  filterUserMatchesEmail,
  getUniqueUsers,
  groupUsersByStatus,
} from '../userHelpers';
import * as eg from '../../__tests__/lib/exampleData';

describe('filterUserList', () => {
  test('empty input results in empty list', () => {
    const users = deepFreeze([]);

    const filteredUsers = filterUserList(users, 'some filter');
    expect(filteredUsers).toEqual(users);
  });

  test('searches in name, email and is case insensitive', () => {
    const user1 = eg.makeUser({ full_name: 'match', email: 'any@example.com' });
    const user2 = eg.makeUser({ full_name: 'partial match', email: 'any@example.com' });
    const user3 = eg.makeUser({ full_name: 'Case Insensitive MaTcH', email: 'any@example.com' });
    const user4 = eg.makeUser({ full_name: 'Any Name', email: 'match@example.com' });
    const user5 = eg.makeUser({ full_name: 'some name', email: 'another@example.com' });
    const allUsers = deepFreeze([user1, user2, user3, user4, user5]);

    const shouldMatch = [user1, user2, user3, user4];
    const filteredUsers = filterUserList(allUsers, 'match');
    expect(filteredUsers).toEqual(shouldMatch);
  });
});

describe('getAutocompleteSuggestion', () => {
  test('empty input results in empty list', () => {
    const users = deepFreeze([]);

    const filteredUsers = getAutocompleteSuggestion(
      users,
      'some filter',
      eg.selfUser.user_id,
      Immutable.Map(),
    );
    expect(filteredUsers).toBe(users);
  });

  test("filters out user's own entry", () => {
    const someGuyUser = eg.makeUser({ full_name: 'Some Guy' });
    const meUser = eg.makeUser({ full_name: 'Me' });
    const users = deepFreeze([someGuyUser, meUser]);

    const shouldMatch = [
      { user_id: -1, full_name: 'all', email: '(Notify everyone)' },
      someGuyUser,
    ];
    const filteredUsers = getAutocompleteSuggestion(users, '', meUser.user_id, Immutable.Map());
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('filters out muted user', () => {
    const mutedUser = eg.makeUser({ full_name: 'Muted User' });
    const meUser = eg.makeUser({ full_name: 'Me' });
    const users = deepFreeze([mutedUser, meUser]);

    const mutedUsers = Immutable.Map([[mutedUser.user_id, 0]]);

    const shouldMatch = [{ user_id: -1, full_name: 'all', email: '(Notify everyone)' }];

    const filteredUsers = getAutocompleteSuggestion(users, '', meUser.user_id, mutedUsers);
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('searches in name, email and is case insensitive', () => {
    const user1 = eg.makeUser({ full_name: 'match', email: 'any1@example.com' });
    const user2 = eg.makeUser({ full_name: 'match this', email: 'any2@example.com' });
    const user3 = eg.makeUser({ full_name: 'MaTcH Case Insensitive', email: 'any3@example.com' });
    const user4 = eg.makeUser({ full_name: 'some name', email: 'another@example.com' });
    const user5 = eg.makeUser({ full_name: 'Example', email: 'match@example.com' });
    const allUsers = deepFreeze([user1, user2, user3, user4, user5]);

    const shouldMatch = [user1, user2, user3, user5];
    const filteredUsers = getAutocompleteSuggestion(
      allUsers,
      'match',
      eg.selfUser.user_id,
      Immutable.Map(),
    );
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('result should be in priority of startsWith, contains in name, matches in email', () => {
    const user1 = eg.makeUser({ full_name: 'M Apple', email: 'any1@example.com' }); // does not match
    const user2 = eg.makeUser({ full_name: 'Normal boy', email: 'any2@example.com' }); // satisfy full_name contains condition
    const user3 = eg.makeUser({ full_name: 'example', email: 'example@example.com' }); // random entry
    const user4 = eg.makeUser({ full_name: 'Example', email: 'match@example.com' }); // satisfy email match condition
    const user5 = eg.makeUser({ full_name: 'match', email: 'any@example.com' }); // satisfy full_name starts with condition
    const user6 = eg.makeUser({ full_name: 'match', email: 'normal@example.com' }); // satisfy starts with and email condition
    const user7 = eg.makeUser({ full_name: 'Match App Normal', email: 'any3@example.com' }); // satisfy all conditions
    const user8 = eg.makeUser({ full_name: 'match', email: 'any@example.com' }); // duplicate
    const user9 = eg.makeUser({ full_name: 'Laptop', email: 'laptop@example.com' }); // random entry
    const user10 = eg.makeUser({ full_name: 'Mobile App', email: 'any@match.com' }); // satisfy email condition
    const user11 = eg.makeUser({ full_name: 'Normal', email: 'match2@example.com' }); // satisfy contains in name and matches in email condition
    const allUsers = deepFreeze([
      user1,
      user2,
      user3,
      user4,
      user5,
      user6,
      user7,
      user8,
      user9,
      user10,
      user11,
    ]);

    const shouldMatch = [
      user5, // name starts with 'ma'
      user6, // have priority as starts with 'ma'
      user7, // have priority as starts with 'ma'
      user2, // name contains in 'ma'
      user11, // have priority because of 'ma' contains in name
      user4, // email contains 'ma'
      user10, // email contains 'ma'
    ];
    const filteredUsers = getAutocompleteSuggestion(
      allUsers,
      'ma',
      eg.selfUser.user_id,
      Immutable.Map(),
    );
    expect(filteredUsers).toEqual(shouldMatch);
  });
});

describe('getAutocompleteUserGroupSuggestions', () => {
  test('empty input results in empty list', () => {
    const userGroups = deepFreeze([]);

    const filteredUserGroups = getAutocompleteUserGroupSuggestions(userGroups, 'some filter');

    expect(filteredUserGroups).toEqual(userGroups);
  });

  test('searches in name and description, case-insensitive', () => {
    const userGroup1 = eg.makeUserGroup({ name: 'some user group', description: '' });
    const userGroup2 = eg.makeUserGroup({ name: 'another one', description: '' });
    const userGroup3 = eg.makeUserGroup({ name: 'last one', description: 'This is a Group' });
    const userGroups = deepFreeze([userGroup1, userGroup2, userGroup3]);

    const shouldMatch = [userGroup1, userGroup3];

    const filteredUsers = getAutocompleteUserGroupSuggestions(userGroups, 'group');

    expect(filteredUsers).toEqual(shouldMatch);
  });
});

describe('sortUserList', () => {
  test('sorts list by name', () => {
    const user1 = eg.makeUser({ full_name: 'abc' });
    const user2 = eg.makeUser({ full_name: 'xyz' });
    const user3 = eg.makeUser({ full_name: 'jkl' });
    const users = deepFreeze([user1, user2, user3]);
    const presences = {};
    const shouldMatch = [user1, user3, user2];

    const sortedUsers = sortUserList(users, presences);

    expect(sortedUsers).toEqual(shouldMatch);
  });

  test('prioritizes status', () => {
    const user1 = eg.makeUser({ full_name: 'Mark' });
    const user2 = eg.makeUser({ full_name: 'John' });
    const user3 = eg.makeUser({ full_name: 'Bob' });
    const user4 = eg.makeUser({ full_name: 'Rick' });
    const users = deepFreeze([user1, user2, user3, user4]);
    const presences = {
      [user1.email]: {
        aggregated: { client: 'website', status: 'offline', timestamp: Date.now() / 1000 - 300 },
      },
      [user2.email]: {
        aggregated: {
          client: 'website',
          status: 'active',
          timestamp: Date.now() / 1000 - 120 * 60,
        },
      },
      [user3.email]: {
        aggregated: { client: 'website', status: 'idle', timestamp: Date.now() / 1000 - 20 * 60 },
      },
      [user4.email]: {
        aggregated: { client: 'website', status: 'active', timestamp: Date.now() / 1000 },
      },
    };
    const shouldMatch = [user4, user3, user2, user1];

    const sortedUsers = sortUserList(users, presences);

    expect(sortedUsers).toEqual(shouldMatch);
  });
});

describe('filterUserStartWith', () => {
  test('returns users whose name starts with filter excluding self', () => {
    const user1 = eg.makeUser({ full_name: 'Apple' });
    const user2 = eg.makeUser({ full_name: 'bob' });
    const user3 = eg.makeUser({ full_name: 'app' });
    const user4 = eg.makeUser({ full_name: 'Mobile app' });
    const user5 = eg.makeUser({ full_name: 'Mac App' });
    const selfUser = eg.makeUser({ full_name: 'app' });
    const users = deepFreeze([user1, user2, user3, user4, user5, selfUser]);

    const expectedUsers = [user1, user3];
    expect(filterUserStartWith(users, 'app', selfUser.user_id)).toEqual(expectedUsers);
  });

  test('returns users whose name contains diacritics but otherwise starts with filter', () => {
    const withDiacritics = eg.makeUser({ full_name: 'Frödö' });
    const withoutDiacritics = eg.makeUser({ full_name: 'Frodo' });
    const nonMatchingUser = eg.makeUser({ full_name: 'Zalix' });
    const users = deepFreeze([withDiacritics, withoutDiacritics, nonMatchingUser]);
    const expectedUsers = [withDiacritics, withoutDiacritics];
    expect(filterUserStartWith(users, 'Fro', eg.makeUser().user_id)).toEqual(expectedUsers);
  });

  test('returns users whose name contains diacritics and filter uses diacritics', () => {
    const withDiacritics = eg.makeUser({ full_name: 'Frödö' });
    const withoutDiacritics = eg.makeUser({ full_name: 'Frodo' });
    const wrongDiacritics = eg.makeUser({ full_name: 'Frōdō' });
    const notIncludedDiactritic = eg.makeUser({ full_name: 'Fřödo' });
    const nonMatchingUser = eg.makeUser({ full_name: 'Zalix' });
    const users = deepFreeze([
      withDiacritics,
      withoutDiacritics,
      wrongDiacritics,
      notIncludedDiactritic,
      nonMatchingUser,
    ]);
    const expectedUsers = [withDiacritics];
    expect(filterUserStartWith(users, 'Frö', eg.makeUser().user_id)).toEqual(expectedUsers);
  });
});

describe('groupUsersByStatus', () => {
  test('empty input results in empty map !!!', () => {
    const users = deepFreeze([]);
    const presence = deepFreeze({});

    const groupedUsers = groupUsersByStatus(users, presence);
    expect(groupedUsers).toEqual({ active: [], idle: [], unavailable: [], offline: [] });
  });

  test('sort input by status, when no presence entry consider offline', () => {
    const user1 = eg.makeUser();
    const user2 = eg.makeUser();
    const user3 = eg.makeUser();
    const user4 = eg.makeUser();
    const users = deepFreeze([user1, user2, user3, user4]);
    const presence = {
      [user1.email]: {
        aggregated: { client: 'website', status: 'active', timestamp: Date.now() / 1000 },
      },
      [user2.email]: {
        aggregated: { client: 'website', status: 'idle', timestamp: Date.now() / 1000 - 10 },
      },
      [user3.email]: {
        aggregated: { client: 'website', status: 'offline', timestamp: Date.now() / 1000 - 150 },
      },
    };
    const expectedResult = {
      active: [user1],
      idle: [user2],
      offline: [user3, user4],
      unavailable: [],
    };

    const groupedUsers = groupUsersByStatus(users, presence);
    expect(groupedUsers).toEqual(expectedResult);
  });
});

describe('filterUserThatContains', () => {
  test('returns users whose full_name contains filter excluding self', () => {
    const user1 = eg.makeUser({ full_name: 'Apple' });
    const user2 = eg.makeUser({ full_name: 'mam' });
    const user3 = eg.makeUser({ full_name: 'app' });
    const user4 = eg.makeUser({ full_name: 'Mobile app' });
    const user5 = eg.makeUser({ full_name: 'Mac App' });
    const user6 = eg.makeUser({ full_name: 'app' });
    const selfUser = eg.makeUser({ full_name: 'app' });

    const users = deepFreeze([user1, user2, user3, user4, user5, user6, selfUser]);

    const expectedUsers = [user2, user5];
    expect(filterUserThatContains(users, 'ma', selfUser.user_id)).toEqual(expectedUsers);
  });

  test('returns users whose full_name has diacritics but otherwise contains filter', () => {
    const withDiacritics = eg.makeUser({ full_name: 'Aärdvärk' });
    const withoutDiacritics = eg.makeUser({ full_name: 'Aardvark' });
    const nonMatchingUser = eg.makeUser({ full_name: 'Turtle' });
    const users = deepFreeze([withDiacritics, withoutDiacritics, nonMatchingUser]);
    const expectedUsers = [withDiacritics, withoutDiacritics];
    expect(filterUserThatContains(users, 'vark', eg.makeUser().user_id)).toEqual(expectedUsers);
  });

  test('returns users whose full_name has diacritics and filter uses diacritics', () => {
    const withDiacritics = eg.makeUser({ full_name: 'Aärdvärk' });
    const withoutDiacritics = eg.makeUser({ full_name: 'Aardvark' });
    const wrongDiacritics = eg.makeUser({ full_name: 'Aärdvãrk' });
    const notIncludedDiactritic = eg.makeUser({ full_name: 'Aärdväŕk' });
    const nonMatchingUser = eg.makeUser({ full_name: 'Turtle' });
    const users = deepFreeze([
      withDiacritics,
      withoutDiacritics,
      wrongDiacritics,
      notIncludedDiactritic,
      nonMatchingUser,
    ]);
    const expectedUsers = [withDiacritics];
    expect(filterUserThatContains(users, 'värk', eg.makeUser().user_id)).toEqual(expectedUsers);
  });
});

describe('filterUserMatchesEmail', () => {
  test('returns users whose email matches filter excluding self', () => {
    const user1 = eg.makeUser({ email: 'a@example.com' });
    const user2 = eg.makeUser({ email: 'f@app.com' });
    const user3 = eg.makeUser({ email: 'p@p.com' });
    const user4 = eg.makeUser({ email: 'p3@p.com' });
    const user5 = eg.makeUser({ email: 'p@p2.com' });
    const user6 = eg.makeUser({ email: 'p@p.com' });
    const selfUser = eg.makeUser({ email: 'own@example.com' });

    const users = deepFreeze([user1, user2, user3, user4, user5, user6, selfUser]);
    const expectedUsers = [user1];
    expect(filterUserMatchesEmail(users, 'example', selfUser.user_id)).toEqual(expectedUsers);
  });
});

describe('getUniqueUsers', () => {
  test('returns unique users check by email', () => {
    const user1 = eg.makeUser({ email: 'a@example.com' });
    const user2 = eg.makeUser({ email: 'a@example.com' });
    const user3 = eg.makeUser({ email: 'p@p.com' });
    const user4 = eg.makeUser({ email: 'p@p.com' });
    const user5 = eg.makeUser({ email: 'p@p2.com' });
    const user6 = eg.makeUser({ email: 'p@p2.com' });
    const user7 = eg.makeUser({ email: 'p@p2.com' });
    const user8 = eg.makeUser({ email: 'own@example.com' });

    const users = deepFreeze([user1, user2, user3, user4, user5, user6, user7, user8]);

    const expectedUsers = [user1, user3, user5, user8];
    expect(getUniqueUsers(users)).toEqual(expectedUsers);
  });
});
