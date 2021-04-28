/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import Immutable from 'immutable';

import {
  sortUserList,
  filterUserList,
  getAutocompleteSuggestion,
  getAutocompleteUserGroupSuggestions,
  sortAlphabetically,
  filterUserStartWith,
  filterUserByInitials,
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

  test('returns same list if no filter', () => {
    const user1 = eg.makeUser({ name: 'user1' });
    const user2 = eg.makeUser({ name: 'user2' });
    const users = deepFreeze([user1, user2]);

    const filteredUsers = filterUserList(users);
    expect(filteredUsers).toEqual(users);
  });

  test("filters out user's own entry", () => {
    const user1 = eg.makeUser({ name: 'user1' });
    const user2 = eg.makeUser({ name: 'user2' });
    const users = deepFreeze([user1, user2]);

    const shouldMatch = [user1];
    const filteredUsers = filterUserList(users, '', user2.user_id);
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('searches in name, email and is case insensitive', () => {
    const user1 = { ...eg.makeUser({ name: 'match' }), email: 'any@example.com' };
    const user2 = { ...eg.makeUser({ name: 'partial match' }), email: 'any@example.com' };
    const user3 = { ...eg.makeUser({ name: 'Case Insensitive MaTcH' }), email: 'any@example.com' };
    const user4 = { ...eg.makeUser({ name: 'Any Name' }), email: 'match@example.com' };
    const user5 = { ...eg.makeUser({ name: 'some name' }), email: 'another@example.com' };
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
    const someGuyUser = eg.makeUser({ name: 'Some Guy' });
    const meUser = eg.makeUser({ name: 'Me' });
    const users = deepFreeze([someGuyUser, meUser]);

    const shouldMatch = [
      { user_id: -1, full_name: 'all', email: '(Notify everyone)' },
      someGuyUser,
    ];
    const filteredUsers = getAutocompleteSuggestion(users, '', meUser.user_id, Immutable.Map());
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('filters out muted user', () => {
    const mutedUser = eg.makeUser({ name: 'Muted User' });
    const meUser = eg.makeUser({ name: 'Me' });
    const users = deepFreeze([mutedUser, meUser]);

    const mutedUsers = Immutable.Map([[mutedUser.user_id, 0]]);

    const shouldMatch = [{ user_id: -1, full_name: 'all', email: '(Notify everyone)' }];

    const filteredUsers = getAutocompleteSuggestion(users, '', meUser.user_id, mutedUsers);
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('searches in name, email and is case insensitive', () => {
    const user1 = { ...eg.makeUser({ name: 'match' }), email: 'any1@example.com' };
    const user2 = { ...eg.makeUser({ name: 'match this' }), email: 'any2@example.com' };
    const user3 = { ...eg.makeUser({ name: 'MaTcH Case Insensitive' }), email: 'any3@example.com' };
    const user4 = { ...eg.makeUser({ name: 'some name' }), email: 'another@example.com' };
    const user5 = { ...eg.makeUser({ name: 'Example' }), email: 'match@example.com' };
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

  test('result should be in priority of startsWith, initials, contains in name, matches in email', () => {
    const user1 = { ...eg.makeUser({ name: 'M Apple' }), email: 'any1@example.com' }; // satisfy initials condition
    const user2 = { ...eg.makeUser({ name: 'Normal boy' }), email: 'any2@example.com' }; // satisfy full_name contains condition
    const user3 = { ...eg.makeUser({ name: 'example' }), email: 'example@example.com' }; // random entry
    const user4 = { ...eg.makeUser({ name: 'Example' }), email: 'match@example.com' }; // satisfy email match condition
    const user5 = { ...eg.makeUser({ name: 'match' }), email: 'any@example.com' }; // satisfy full_name starts with condition
    const user6 = { ...eg.makeUser({ name: 'match' }), email: 'normal@example.com' }; // satisfy starts with and email condition
    const user7 = { ...eg.makeUser({ name: 'Match App Normal' }), email: 'any3@example.com' }; // satisfy all conditions
    const user8 = { ...eg.makeUser({ name: 'match' }), email: 'any@example.com' }; // duplicate
    const user9 = { ...eg.makeUser({ name: 'Laptop' }), email: 'laptop@example.com' }; // random entry
    const user10 = { ...eg.makeUser({ name: 'Mobile App' }), email: 'any@match.com' }; // satisfy initials and email condition
    const user11 = { ...eg.makeUser({ name: 'Normal' }), email: 'match2@example.com' }; // satisfy contains in name and matches in email condition
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
      user1, // initials 'MA'
      user10, // have priority because of initials condition
      user2, // name contains in 'ma'
      user11, // have priority because of 'ma' contains in name
      user4, // email contains 'ma'
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
    const user1 = eg.makeUser({ name: 'abc' });
    const user2 = eg.makeUser({ name: 'xyz' });
    const user3 = eg.makeUser({ name: 'jkl' });
    const users = deepFreeze([user1, user2, user3]);
    const presences = {};
    const shouldMatch = [user1, user3, user2];

    const sortedUsers = sortUserList(users, presences);

    expect(sortedUsers).toEqual(shouldMatch);
  });

  test('prioritizes status', () => {
    const user1 = { ...eg.makeUser({ name: 'Mark' }), email: 'mark@example.com' };
    const user2 = { ...eg.makeUser({ name: 'John' }), email: 'john@example.com' };
    const user3 = { ...eg.makeUser({ name: 'Bob' }), email: 'bob@example.com' };
    const user4 = { ...eg.makeUser({ name: 'Rick' }), email: 'rick@example.com' };
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

describe('sortAlphabetically', () => {
  test('alphabetically sort user list by full_name', () => {
    const user1 = { ...eg.makeUser({ name: 'zoe' }), email: 'allen@example.com' };
    const user2 = { ...eg.makeUser({ name: 'Ring' }), email: 'got@example.com' };
    const user3 = { ...eg.makeUser({ name: 'watch' }), email: 'see@example.com' };
    const user4 = { ...eg.makeUser({ name: 'mobile' }), email: 'phone@example.com' };
    const user5 = { ...eg.makeUser({ name: 'Ring' }), email: 'got@example.com' };
    const user6 = { ...eg.makeUser({ name: 'hardware' }), email: 'software@example.com' };
    const user7 = { ...eg.makeUser({ name: 'Bob' }), email: 'tester@example.com' };
    const users = deepFreeze([user1, user2, user3, user4, user5, user6, user7]);

    const expectedUsers = [user7, user6, user4, user2, user5, user3, user1];
    expect(sortAlphabetically(users)).toEqual(expectedUsers);
  });
});

describe('filterUserStartWith', () => {
  test('returns users whose name starts with filter excluding self', () => {
    const user1 = { ...eg.makeUser({ name: 'Apple' }), email: 'a@example.com' };
    const user2 = { ...eg.makeUser({ name: 'bob' }), email: 'f@app.com' };
    const user3 = { ...eg.makeUser({ name: 'app' }), email: 'p@p.com' };
    const user4 = { ...eg.makeUser({ name: 'Mobile app' }), email: 'p3@p.com' };
    const user5 = { ...eg.makeUser({ name: 'Mac App' }), email: 'p@p2.com' };
    const selfUser = { ...eg.makeUser({ name: 'app' }), email: 'own@example.com' };
    const users = deepFreeze([user1, user2, user3, user4, user5, selfUser]);

    const expectedUsers = [user1, user3];
    expect(filterUserStartWith(users, 'app', selfUser.user_id)).toEqual(expectedUsers);
  });
});

describe('filterUserByInitials', () => {
  test('returns users whose full_name initials matches filter excluding self', () => {
    const user1 = { ...eg.makeUser({ name: 'Apple' }), email: 'a@example.com' };
    const user2 = { ...eg.makeUser({ name: 'mam' }), email: 'f@app.com' };
    const user3 = { ...eg.makeUser({ name: 'app' }), email: 'p@p.com' };
    const user4 = { ...eg.makeUser({ name: 'Mobile Application' }), email: 'p3@p.com' };
    const user5 = { ...eg.makeUser({ name: 'Mac App' }), email: 'p@p2.com' };
    const user6 = { ...eg.makeUser({ name: 'app' }), email: 'p@p.com' };
    const selfUser = { ...eg.makeUser({ name: 'app' }), email: 'own@example.com' };

    const users = deepFreeze([user1, user2, user3, user4, user5, user6, selfUser]);

    const expectedUsers = [user4, user5];
    expect(filterUserByInitials(users, 'ma', selfUser.user_id)).toEqual(expectedUsers);
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
    const user1 = { ...eg.makeUser(), email: 'allen@example.com' };
    const user2 = { ...eg.makeUser(), email: 'bob@example.com' };
    const user3 = { ...eg.makeUser(), email: 'carter@example.com' };
    const user4 = { ...eg.makeUser(), email: 'dan@example.com' };
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
    const user1 = { ...eg.makeUser({ name: 'Apple' }), email: 'a@example.com' };
    const user2 = { ...eg.makeUser({ name: 'mam' }), email: 'f@app.com' };
    const user3 = { ...eg.makeUser({ name: 'app' }), email: 'p@p.com' };
    const user4 = { ...eg.makeUser({ name: 'Mobile app' }), email: 'p3@p.com' };
    const user5 = { ...eg.makeUser({ name: 'Mac App' }), email: 'p@p2.com' };
    const user6 = { ...eg.makeUser({ name: 'app' }), email: 'p@p.com' };
    const selfUser = { ...eg.makeUser({ name: 'app' }), email: 'own@example.com' };

    const users = deepFreeze([user1, user2, user3, user4, user5, user6, selfUser]);

    const expectedUsers = [user2, user5];
    expect(filterUserThatContains(users, 'ma', selfUser.user_id)).toEqual(expectedUsers);
  });
});

describe('filterUserMatchesEmail', () => {
  test('returns users whose email matches filter excluding self', () => {
    const user1 = { ...eg.makeUser({ name: 'Apple' }), email: 'a@example.com' };
    const user2 = { ...eg.makeUser({ name: 'mam' }), email: 'f@app.com' };
    const user3 = { ...eg.makeUser({ name: 'app' }), email: 'p@p.com' };
    const user4 = { ...eg.makeUser({ name: 'Mobile app' }), email: 'p3@p.com' };
    const user5 = { ...eg.makeUser({ name: 'Mac App' }), email: 'p@p2.com' };
    const user6 = { ...eg.makeUser({ name: 'app' }), email: 'p@p.com' };
    const selfUser = { ...eg.makeUser({ name: 'app' }), email: 'own@example.com' };

    const users = deepFreeze([user1, user2, user3, user4, user5, user6, selfUser]);
    const expectedUsers = [user1];
    expect(filterUserMatchesEmail(users, 'example', selfUser.user_id)).toEqual(expectedUsers);
  });
});

describe('getUniqueUsers', () => {
  test('returns unique users check by email', () => {
    const user1 = { ...eg.makeUser({ name: 'Apple' }), email: 'a@example.com' };
    const user2 = { ...eg.makeUser({ name: 'Apple' }), email: 'a@example.com' };
    const user3 = { ...eg.makeUser({ name: 'app' }), email: 'p@p.com' };
    const user4 = { ...eg.makeUser({ name: 'app' }), email: 'p@p.com' };
    const user5 = { ...eg.makeUser({ name: 'Mac App' }), email: 'p@p2.com' };
    const user6 = { ...eg.makeUser({ name: 'Mac App' }), email: 'p@p2.com' };
    const user7 = { ...eg.makeUser({ name: 'Mac App 2' }), email: 'p@p2.com' };
    const user8 = { ...eg.makeUser({ name: 'app' }), email: 'own@example.com' };

    const users = deepFreeze([user1, user2, user3, user4, user5, user6, user7, user8]);

    const expectedUsers = [user1, user3, user5, user8];
    expect(getUniqueUsers(users)).toEqual(expectedUsers);
  });
});
