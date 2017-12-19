import deepFreeze from 'deep-freeze';

import {
  sortUserList,
  filterUserList,
  getAutocompleteSuggestion,
  groupUsersByInitials,
  sortAlphabetically,
  filterUserStartWith,
  filterUserByInitials,
  filterUserThatContains,
  filterUserMatchesEmail,
  getUniqueUsers,
  groupUsersByStatus,
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
      { fullName: 'match', email: 'any@example.com' },
      { fullName: 'partial match', email: 'any@example.com' },
      { fullName: 'Case Insensitive MaTcH', email: 'any@example.com' },
      { fullName: 'Any Name', email: 'match@example.com' },
      { fullName: 'some name', email: 'another@example.com' },
    ]);

    const shouldMatch = [
      { fullName: 'match', email: 'any@example.com' },
      { fullName: 'partial match', email: 'any@example.com' },
      { fullName: 'Case Insensitive MaTcH', email: 'any@example.com' },
      { fullName: 'Any Name', email: 'match@example.com' },
    ];
    const filteredUsers = filterUserList(allUsers, 'match');
    expect(filteredUsers).toEqual(shouldMatch);
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
      { email: 'email@example.com', fullName: 'Some Guy' },
      { email: 'my@example.com', fullName: 'Me' },
    ]);

    const shouldMatch = [
      { fullName: 'all', id: 'all', email: '(Notify everyone)' },
      { email: 'email@example.com', fullName: 'Some Guy' },
    ];
    const filteredUsers = getAutocompleteSuggestion(users, '', 'my@example.com');
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('searches in name, email and is case insensitive', () => {
    const allUsers = deepFreeze([
      { fullName: 'match', email: 'any1@example.com' },
      { fullName: 'match this', email: 'any2@example.com' },
      { fullName: 'MaTcH Case Insensitive', email: 'any3@example.com' },
      { fullName: 'some name', email: 'another@example.com' },
      { fullName: 'Example', email: 'match@example.com' },
    ]);

    const shouldMatch = [
      { fullName: 'match', email: 'any1@example.com' },
      { fullName: 'match this', email: 'any2@example.com' },
      { fullName: 'MaTcH Case Insensitive', email: 'any3@example.com' },
      { fullName: 'Example', email: 'match@example.com' },
    ];
    const filteredUsers = getAutocompleteSuggestion(allUsers, 'match');
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('result should be in priority of startsWith, initials, contains in name, matches in email', () => {
    const allUsers = deepFreeze([
      { fullName: 'M Apple', email: 'any1@example.com' }, // satisfy initials condition
      { fullName: 'Normal boy', email: 'any2@example.com' }, // satisfy fullName contains condition
      { fullName: 'example', email: 'example@example.com' }, // random entry
      { fullName: 'Example', email: 'match@example.com' }, // satisfy email match condition
      { fullName: 'match', email: 'any@example.com' }, // satisfy fullName starts with condition
      { fullName: 'match', email: 'normal@example.com' }, // satisfy starts with and email condition
      { fullName: 'Match App Normal', email: 'any3@example.com' }, // satisfy all conditions
      { fullName: 'match', email: 'any@example.com' }, // duplicate
      { fullName: 'Laptop', email: 'laptop@example.com' }, // random entry
      { fullName: 'Mobile App', email: 'any@match.com' }, // satisfy initials and email condition
      { fullName: 'Normal', email: 'match2@example.com' }, // satisfy contains in name and matches in email condition
    ]);

    const shouldMatch = [
      { fullName: 'match', email: 'any@example.com' }, // name starts with 'ma'
      { fullName: 'match', email: 'normal@example.com' }, // have priority as starts with 'ma'
      { fullName: 'Match App Normal', email: 'any3@example.com' }, // have priority as starts with 'ma'
      { fullName: 'M Apple', email: 'any1@example.com' }, // initials 'MA'
      { fullName: 'Mobile App', email: 'any@match.com' }, // have priority because of initials condition
      { fullName: 'Normal boy', email: 'any2@example.com' }, // name contains in 'ma'
      { fullName: 'Normal', email: 'match2@example.com' }, // have priority because of 'ma' contains in name
      { fullName: 'Example', email: 'match@example.com' }, // email contains 'ma'
    ];
    const filteredUsers = getAutocompleteSuggestion(allUsers, 'ma');
    expect(filteredUsers).toEqual(shouldMatch);
  });
});

describe('sortUserList', () => {
  test('sorts list by name', () => {
    const users = deepFreeze([{ fullName: 'abc' }, { fullName: 'xyz' }, { fullName: 'jkl' }]);

    const shouldMatch = [{ fullName: 'abc' }, { fullName: 'jkl' }, { fullName: 'xyz' }];
    const sortedUsers = sortUserList(users);
    expect(sortedUsers).toEqual(shouldMatch);
  });

  test('prioritizes status', () => {
    const users = deepFreeze([
      { fullName: 'abc', status: 'offline' },
      { fullName: 'xyz', status: 'idle' },
      { fullName: 'jkl', status: 'active' },
      { fullName: 'abc', status: 'active' },
    ]);

    const shouldMatch = [
      { fullName: 'abc', status: 'active' },
      { fullName: 'jkl', status: 'active' },
      { fullName: 'xyz', status: 'idle' },
      { fullName: 'abc', status: 'offline' },
    ];
    const sortedUsers = sortUserList(users);
    expect(sortedUsers).toEqual(shouldMatch);
  });
});

describe('groupUsersByInitials', () => {
  test('empty input results in empty map', () => {
    const users = deepFreeze([]);

    const groupedUsers = groupUsersByInitials(users);
    expect(groupedUsers).toEqual({});
  });

  test('empty input results in empty list', () => {
    const users = deepFreeze([
      { fullName: 'Allen' },
      { fullName: 'Bob Tester' },
      { fullName: 'bob bob' },
    ]);

    const groupedUsers = groupUsersByInitials(users);
    expect(groupedUsers).toEqual({
      A: [{ fullName: 'Allen' }],
      B: [{ fullName: 'Bob Tester' }, { fullName: 'bob bob' }],
    });
  });
});

describe('sortAlphabetically', () => {
  test('alphabetically sort user list by fullName', () => {
    const users = deepFreeze([
      { fullName: 'zoe', email: 'allen@example.com' },
      { fullName: 'Ring', email: 'got@example.com' },
      { fullName: 'watch', email: 'see@example.com' },
      { fullName: 'mobile', email: 'phone@example.com' },
      { fullName: 'Ring', email: 'got@example.com' },
      { fullName: 'hardware', email: 'software@example.com' },
      { fullName: 'Bob', email: 'tester@example.com' },
    ]);

    const expectedUsers = [
      { fullName: 'Bob', email: 'tester@example.com' },
      { fullName: 'hardware', email: 'software@example.com' },
      { fullName: 'mobile', email: 'phone@example.com' },
      { fullName: 'Ring', email: 'got@example.com' },
      { fullName: 'Ring', email: 'got@example.com' },
      { fullName: 'watch', email: 'see@example.com' },
      { fullName: 'zoe', email: 'allen@example.com' },
    ];
    expect(sortAlphabetically(users)).toEqual(expectedUsers);
  });
});

describe('filterUserStartWith', () => {
  test('returns users whose name starts with filter excluding self', () => {
    const users = deepFreeze([
      { fullName: 'Apple', email: 'a@example.com' },
      { fullName: 'bob', email: 'f@app.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'Mobile app', email: 'p3@p.com' },
      { fullName: 'Mac App', email: 'p@p2.com' },
      { fullName: 'app', email: 'own@example.com' },
    ]);

    const expectedUsers = [
      { fullName: 'Apple', email: 'a@example.com' },
      { fullName: 'app', email: 'p@p.com' },
    ];
    expect(filterUserStartWith(users, 'app', 'own@example.com')).toEqual(expectedUsers);
  });
});

describe('filterUserByInitials', () => {
  test('returns users whose fullName initials matches filter excluding self', () => {
    const users = deepFreeze([
      { fullName: 'Apple', email: 'a@example.com' },
      { fullName: 'mam', email: 'f@app.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'Mobile Application', email: 'p3@p.com' },
      { fullName: 'Mac App', email: 'p@p2.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'app', email: 'own@example.com' },
    ]);

    const expectedUsers = [
      { fullName: 'Mobile Application', email: 'p3@p.com' },
      { fullName: 'Mac App', email: 'p@p2.com' },
    ];
    expect(filterUserByInitials(users, 'ma', 'own@example.com')).toEqual(expectedUsers);
  });
});

describe('groupUsersByStatus', () => {
  test('empty input results in empty map !!!', () => {
    const users = deepFreeze([]);
    const presence = deepFreeze({});

    const groupedUsers = groupUsersByStatus(users, presence);
    expect(groupedUsers).toEqual({ active: [], idle: [], offline: [] });
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
      'bob@example.com': { aggregated: { status: 'idle' } },
      'carter@example.com': { aggregated: { status: 'offline' } },
    };
    const expectedResult = {
      active: [{ email: 'allen@example.com' }],
      idle: [{ email: 'bob@example.com' }],
      offline: [{ email: 'carter@example.com' }, { email: 'dan@example.com' }],
    };

    const groupedUsers = groupUsersByStatus(users, presence);
    expect(groupedUsers).toEqual(expectedResult);
  });
});

describe('filterUserThatContains', () => {
  test('returns users whose fullName contains filter excluding self', () => {
    const users = deepFreeze([
      { fullName: 'Apple', email: 'a@example.com' },
      { fullName: 'mam', email: 'f@app.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'Mobile app', email: 'p3@p.com' },
      { fullName: 'Mac App', email: 'p@p2.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'app', email: 'own@example.com' },
    ]);

    const expectedUsers = [
      { fullName: 'mam', email: 'f@app.com' },
      { fullName: 'Mac App', email: 'p@p2.com' },
    ];
    expect(filterUserThatContains(users, 'ma', 'own@example.com')).toEqual(expectedUsers);
  });
});

describe('filterUserMatchesEmail', () => {
  test('returns users whose email matches filter excluding self', () => {
    const users = deepFreeze([
      { fullName: 'Apple', email: 'a@example.com' },
      { fullName: 'mam', email: 'f@app.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'Mobile app', email: 'p3@p.com' },
      { fullName: 'Mac App', email: 'p@p2.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'app', email: 'own@example.com' },
    ]);

    const expectedUsers = [{ fullName: 'Apple', email: 'a@example.com' }];
    expect(filterUserMatchesEmail(users, 'example', 'own@example.com')).toEqual(expectedUsers);
  });
});

describe('getUniqueUsers', () => {
  test('returns unique users check by email', () => {
    const users = deepFreeze([
      { fullName: 'Apple', email: 'a@example.com' },
      { fullName: 'Apple', email: 'a@example.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'Mac App', email: 'p@p2.com' },
      { fullName: 'Mac App', email: 'p@p2.com' },
      { fullName: 'Mac App 2', email: 'p@p2.com' },
      { fullName: 'app', email: 'own@example.com' },
    ]);

    const expectedUsers = [
      { fullName: 'Apple', email: 'a@example.com' },
      { fullName: 'app', email: 'p@p.com' },
      { fullName: 'Mac App', email: 'p@p2.com' },
      { fullName: 'app', email: 'own@example.com' },
    ];
    expect(getUniqueUsers(users)).toEqual(expectedUsers);
  });
});
