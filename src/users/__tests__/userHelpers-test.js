import deepFreeze from 'deep-freeze';

import {
  sortUserList,
  filterUserList,
  getAutocompleteSuggestion,
  getAutocompleteUserGroupSuggestions,
  sortAlphabetically,
  filterUserStartWith,
  filterUserByInitials,
  getUniqueUsers,
  groupUsersByStatus,
  filterUserEmailStartWith,
  sortByPositionOfKeyword,
} from '../userHelpers';

describe('filterUserList', () => {
  test('empty input results in empty list', () => {
    const users = deepFreeze([]);

    const filteredUsers = filterUserList(users, 'some filter');
    expect(filteredUsers).toBe(users);
  });

  test('returns same list if no filter', () => {
    const users = deepFreeze([{ email: 'user1@example.com' }, { email: 'user2@example.com' }]);

    const filteredUsers = filterUserList(users);
    expect(filteredUsers).toEqual(users);
  });

  test("filters out user's own entry", () => {
    const users = deepFreeze([{ email: 'email@example.com' }, { email: 'my@example.com' }]);

    const shouldMatch = [{ email: 'email@example.com' }];
    const filteredUsers = filterUserList(users, '', 'my@example.com');
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('searches in name, email and is case insensitive', () => {
    const allUsers = deepFreeze([
      { full_name: 'match', email: 'any@example.com' },
      { full_name: 'partial match', email: 'any@example.com' },
      { full_name: 'Case Insensitive MaTcH', email: 'any@example.com' },
      { full_name: 'Any Name', email: 'match@example.com' },
      { full_name: 'some name', email: 'another@example.com' },
    ]);

    const shouldMatch = [
      { full_name: 'match', email: 'any@example.com' },
      { full_name: 'partial match', email: 'any@example.com' },
      { full_name: 'Case Insensitive MaTcH', email: 'any@example.com' },
      { full_name: 'Any Name', email: 'match@example.com' },
    ];
    const filteredUsers = filterUserList(allUsers, 'match');
    expect(filteredUsers).toEqual(shouldMatch);
  });
});

describe('Sort by position of keyword', () => {
  test('result should be in priority of startsWith, email, matches initial, contains', () => {
    const allUsers = deepFreeze([
      { full_name: 'Normal boy', email: 'any2@example.com' }, // satisfy full_name contains condition
      { full_name: 'Example', email: 'match@example.com' }, // satisfy email starts with condition
      { full_name: 'match', email: 'any@example.com' }, // satisfy full_name starts with condition
      { full_name: 'match', email: 'normal@example.com' }, // satisfy starts with and full_name contains and email contains condition
      { full_name: 'Match App Normal', email: 'any3@example.com' }, // satisfy starts with and full_name contains condition
      { full_name: 'match', email: 'any@example.com' }, // duplicate
      { full_name: 'Mobile App', email: 'any@match.com' }, // satisfy email contains condition
      { full_name: 'Normal', email: 'match2@example.com' }, // satisfy contains in full_name and  email starts with condition
    ]);

    const shouldMatch = [
      { full_name: 'match', email: 'any@example.com' }, // name starts with 'ma'
      { full_name: 'match', email: 'normal@example.com' }, // have priority as starts with 'ma'
      { full_name: 'Match App Normal', email: 'any3@example.com' }, // have priority as starts with 'ma'
      { full_name: 'Example', email: 'match@example.com' }, // email starts with 'ma'
      { full_name: 'Normal', email: 'match2@example.com' }, // have priority as email starts with 'ma'
      { full_name: 'Mobile App', email: 'any@match.com' }, // have priority because of initials condition
      { full_name: 'Normal boy', email: 'any2@example.com' }, // name contains in 'ma'
    ];

    const sortedUsers = sortByPositionOfKeyword(allUsers, 'ma');
    expect(sortedUsers).toEqual(shouldMatch);
  });
});

describe('getAutocompleteSuggestion', () => {
  test('empty input results in empty list', () => {
    const users = deepFreeze([]);

    const filteredUsers = getAutocompleteSuggestion(users, 'some filter');
    expect(filteredUsers).toBe(users);
  });

  test("filters out user's own entry", () => {
    const users = deepFreeze([
      { email: 'email@example.com', full_name: 'Some Guy' },
      { email: 'my@example.com', full_name: 'Me' },
    ]);

    const shouldMatch = [
      {
        full_name: 'all',
        email: '(Notify everyone)',
        user_id: -1,
        avatar_url: '',
        timezone: '',
        is_admin: false,
        is_bot: false,
      },
      {
        avatar_url: '',
        email: '(Notify everyone)',
        full_name: 'everyone',
        is_admin: false,
        is_bot: false,
        timezone: '',
        user_id: -1,
      },
      { email: 'email@example.com', full_name: 'Some Guy' },
    ];
    const filteredUsers = getAutocompleteSuggestion(users, '', 'my@example.com');
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('searches in name, email and is case insensitive', () => {
    const allUsers = deepFreeze([
      { full_name: 'match', email: 'any1@example.com' },
      { full_name: 'match this', email: 'any2@example.com' },
      { full_name: 'MaTcH Case Insensitive', email: 'any3@example.com' },
      { full_name: 'some name', email: 'another@example.com' },
      { full_name: 'Example', email: 'match@example.com' },
    ]);

    const shouldMatch = [
      { full_name: 'match', email: 'any1@example.com' },
      { full_name: 'match this', email: 'any2@example.com' },
      { full_name: 'MaTcH Case Insensitive', email: 'any3@example.com' },
      { full_name: 'Example', email: 'match@example.com' },
    ];
    const filteredUsers = getAutocompleteSuggestion(allUsers, 'match');
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('result should be in priority of startsWith, email, matches initial, contains', () => {
    const allUsers = deepFreeze([
      { full_name: 'M Apple', email: 'any1@example.com' }, // does not satisfy initials condition
      { full_name: 'Normal boy', email: 'any2@example.com' }, // satisfy full_name contains condition
      { full_name: 'example', email: 'example@example.com' }, // random entry
      { full_name: 'Example', email: 'match@example.com' }, // satisfy email starts with condition
      { full_name: 'match', email: 'any@example.com' }, // satisfy full_name starts with condition
      { full_name: 'match', email: 'normal@example.com' }, // satisfy starts with and full_name contains and email contains condition
      { full_name: 'Match App Normal', email: 'any3@example.com' }, // satisfy starts with and full_name contains condition
      { full_name: 'match', email: 'any@example.com' }, // duplicate
      { full_name: 'Laptop', email: 'laptop@example.com' }, // random entry
      { full_name: 'Mobile App', email: 'any@match.com' }, // satisfy email contains condition
      { full_name: 'Normal', email: 'match2@example.com' }, // satisfy contains in full_name and  email starts with condition
    ]);

    const shouldMatch = [
      { full_name: 'match', email: 'any@example.com' }, // name starts with 'ma'
      { full_name: 'match', email: 'normal@example.com' }, // have priority as starts with 'ma'
      { full_name: 'Match App Normal', email: 'any3@example.com' }, // have priority as starts with 'ma'
      { full_name: 'Example', email: 'match@example.com' }, // email starts with 'ma'
      { full_name: 'Normal', email: 'match2@example.com' }, // have priority as email starts with 'ma'
      { full_name: 'Mobile App', email: 'any@match.com' }, // have priority because of initials condition
      { full_name: 'Normal boy', email: 'any2@example.com' }, // name contains in 'ma'
    ];
    const filteredUsers = getAutocompleteSuggestion(allUsers, 'ma');
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
    const userGroups = deepFreeze([
      { name: 'some user group', description: '' },
      { name: 'another one', description: '' },
      { name: 'last one', description: 'This is a Group' },
    ]);
    const shouldMatch = [
      { name: 'some user group', description: '' },
      { name: 'last one', description: 'This is a Group' },
    ];

    const filteredUsers = getAutocompleteUserGroupSuggestions(userGroups, 'group');

    expect(filteredUsers).toEqual(shouldMatch);
  });
});

describe('sortUserList', () => {
  test('sorts list by name', () => {
    const filteredUsers = deepFreeze([
      { full_name: 'User ZulipWeb', email: 'user@testing.com' },
      { full_name: 'Zulip Maintainer', email: 'maintatiner@sort.com' },
      { full_name: 'Contributor', email: 'contributorZulip@example.com' },
      { full_name: 'Organizers oZulip', email: 'test@match.com' },
      { full_name: 'test name', email: 'zulp@example2.com' },
      { full_name: 'Zulip Mobile', email: 'mobile@example.com' },
    ]);
    const shouldMatch = [
      { full_name: 'Zulip Maintainer', email: 'maintatiner@sort.com' }, // name starts with 'zu'
      { full_name: 'Zulip Mobile', email: 'mobile@example.com' }, // name starts with 'zu'
      { full_name: 'test name', email: 'zulp@example2.com' }, // email starts with 'zu'
      { full_name: 'User ZulipWeb', email: 'user@testing.com' }, // initial starts with 'zu'
      { full_name: 'Contributor', email: 'contributorZulip@example.com' }, // contains 'zu' in the email and comes first alphabetically
      { full_name: 'Organizers oZulip', email: 'test@match.com' }, // contains zu in name and comes last alphabetically
    ];
    const presences = {};

    const sortedUsers = sortUserList(filteredUsers, presences, 'zu');
    expect(sortedUsers).toEqual(shouldMatch);
  });

  test('prioritizes status', () => {
    const users = deepFreeze([
      { full_name: 'Mark', email: 'mark@example.com' }, // adds to Offline as it's status.
      { full_name: 'John', email: 'john@example.com' }, // adds to offline as its having a greater value of timestamp
      { full_name: 'Bob', email: 'bob@example.com' }, // adds to offline as its having a greater value of timestamp
      { full_name: 'Rick', email: 'rick@example.com' }, // adds to offline as its having a greater value of timestamp
      { full_name: 'Ram', email: 'ramsy@test.com' }, // adds to idle as it's status
      { full_name: 'Sam', email: 'sam@example.com' }, // adds to active as it's status
    ]);
    const presences = {
      'mark@example.com': { aggregated: { status: 'offline' } },
      'john@example.com': {
        aggregated: { status: 'active', timestamp: Date.now() / 1000 - 120 * 60 },
      },
      'bob@example.com': { aggregated: { status: 'idle', timestamp: Date.now() / 1000 - 20 * 60 } },
      'rick@example.com': { aggregated: { status: 'active', timestamp: Date.now() / 1000 } },
      'ramsy@test.com': { aggregated: { status: 'idle' } },
      'sam@example.com': { aggregated: { status: 'active' } },
    };
    const shouldMatch = [
      { full_name: 'Rick', email: 'rick@example.com' },
      { full_name: 'Sam', email: 'sam@example.com' },
      { full_name: 'Ram', email: 'ramsy@test.com' },
      { full_name: 'Mark', email: 'mark@example.com' },
      { full_name: 'John', email: 'john@example.com' },
      { full_name: 'Bob', email: 'bob@example.com' },
    ];

    const sortedUsers = sortUserList(users, presences);

    expect(sortedUsers).toEqual(shouldMatch);
  });
});

describe('sortAlphabetically', () => {
  test('alphabetically sort user list by full_name', () => {
    const users = deepFreeze([
      { full_name: 'zoe', email: 'allen@example.com' },
      { full_name: 'Ring', email: 'got@example.com' },
      { full_name: 'watch', email: 'see@example.com' },
      { full_name: 'mobile', email: 'phone@example.com' },
      { full_name: 'Ring', email: 'got@example.com' },
      { full_name: 'hardware', email: 'software@example.com' },
      { full_name: 'Bob', email: 'tester@example.com' },
    ]);

    const expectedUsers = [
      { full_name: 'Bob', email: 'tester@example.com' },
      { full_name: 'hardware', email: 'software@example.com' },
      { full_name: 'mobile', email: 'phone@example.com' },
      { full_name: 'Ring', email: 'got@example.com' },
      { full_name: 'Ring', email: 'got@example.com' },
      { full_name: 'watch', email: 'see@example.com' },
      { full_name: 'zoe', email: 'allen@example.com' },
    ];
    expect(sortAlphabetically(users)).toEqual(expectedUsers);
  });
});

describe('filterUserStartWith', () => {
  test('returns users whose name starts with filter', () => {
    const users = deepFreeze([
      { full_name: 'Apple', email: 'a@example.com' },
      { full_name: 'bob', email: 'f@app.com' },
      { full_name: 'app', email: 'p@p.com' },
      { full_name: 'Mobile app', email: 'p3@p.com' },
      { full_name: 'Mac App', email: 'p@p2.com' },
      { full_name: 'app', email: 'own@example.com' },
    ]);

    const expectedUsers = [
      { full_name: 'Apple', email: 'a@example.com' },
      { full_name: 'app', email: 'p@p.com' },
      { full_name: 'app', email: 'own@example.com' },
    ];
    expect(filterUserStartWith(users, 'app', 'own@example.com')).toEqual(expectedUsers);
  });
});

describe('filterUserEmailStartWith', () => {
  test('returns users whose email starts with filter', () => {
    const users = deepFreeze([
      { full_name: 'zoe', email: 'allen@example.com' },
      { full_name: 'Lord', email: 'gotest@example.com' },
      { full_name: 'Zulmobi', email: 'phone@example.com' },
      { full_name: 'Ross', email: 'ganophi@example.com' },
      { full_name: 'hardware', email: 'gomez@example.com' },
      { full_name: 'Marley', email: 'tester@example.com' },
      { full_name: 'gotham', email: 'gotham@example.com' },
    ]);

    const expectedUsers = [
      { full_name: 'Lord', email: 'gotest@example.com' },
      { full_name: 'hardware', email: 'gomez@example.com' },
      { full_name: 'gotham', email: 'gotham@example.com' },
    ];
    expect(filterUserEmailStartWith(users, 'go')).toEqual(expectedUsers);
  });
});

describe('filterUserByInitials', () => {
  test('returns users whose full_name initials matches filter excluding self', () => {
    const users = deepFreeze([
      { full_name: 'Apple', email: 'a@example.com' },
      { full_name: 'mam', email: 'f@app.com' },
      { full_name: 'app', email: 'p@p.com' },
      { full_name: 'Mobile Application', email: 'p3@p.com' },
      { full_name: 'Mac App', email: 'p@p2.com' },
      { full_name: 'app', email: 'p@p.com' },
      { full_name: 'app', email: 'own@example.com' },
    ]);

    const expectedUsers = [
      { full_name: 'Mobile Application', email: 'p3@p.com' },
      { full_name: 'Mac App', email: 'p@p2.com' },
    ];
    expect(filterUserByInitials(users, 'ma', 'own@example.com')).toEqual(expectedUsers);
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
    const users = deepFreeze([
      { email: 'allen@example.com' },
      { email: 'bob@example.com' },
      { email: 'carter@example.com' },
      { email: 'dan@example.com' },
    ]);
    const presence = {
      'allen@example.com': { aggregated: { status: 'active' } },
      'bob@example.com': { aggregated: { status: 'idle', timestamp: Date.now() / 1000 - 10 } },
      'carter@example.com': { aggregated: { status: 'offline' } },
    };
    const expectedResult = {
      active: [{ email: 'allen@example.com' }],
      idle: [{ email: 'bob@example.com' }],
      offline: [{ email: 'carter@example.com' }, { email: 'dan@example.com' }],
      unavailable: [],
    };

    const groupedUsers = groupUsersByStatus(users, presence);
    expect(groupedUsers).toEqual(expectedResult);
  });
});

describe('getUniqueUsers', () => {
  test('returns unique users check by email', () => {
    const users = deepFreeze([
      { full_name: 'Apple', email: 'a@example.com' },
      { full_name: 'Apple', email: 'a@example.com' },
      { full_name: 'app', email: 'p@p.com' },
      { full_name: 'app', email: 'p@p.com' },
      { full_name: 'Mac App', email: 'p@p2.com' },
      { full_name: 'Mac App', email: 'p@p2.com' },
      { full_name: 'Mac App 2', email: 'p@p2.com' },
      { full_name: 'app', email: 'own@example.com' },
    ]);

    const expectedUsers = [
      { full_name: 'Apple', email: 'a@example.com' },
      { full_name: 'app', email: 'p@p.com' },
      { full_name: 'Mac App', email: 'p@p2.com' },
      { full_name: 'app', email: 'own@example.com' },
    ];
    expect(getUniqueUsers(users)).toEqual(expectedUsers);
  });
});
