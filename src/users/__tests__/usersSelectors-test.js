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
  getAccountDetailsUser,
  getAllActiveUsers,
  getAllActiveUsersWithStatus,
} from '../userSelectors';

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

    const shouldMatch = [{ email: 'email@example.com', fullName: 'Some Guy' }];
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

describe('getAccountDetailsUser', () => {
  test('return user for the account details screen', () => {
    const state = {
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
      users: [{ firstName: 'a', email: 'a@a.com' }, { firstName: 'b', email: 'b@a.com' }],
    };
    deepFreeze(state);
    const expectedUser = { firstName: 'b', email: 'b@a.com' };
    const actualUser = getAccountDetailsUser(state);

    expect(actualUser).toEqual(expectedUser);
  });
});

describe('getAllActiveUsers', () => {
  test('return all active users from state', () => {
    const state = {
      users: [
        { id: 1, fullName: 'Abc', isActive: true },
        { id: 2, fullName: 'Def', isActive: false },
        { id: 3, fullName: 'Xyz', isActive: true },
      ],
    };
    deepFreeze(state);
    const expectedUsers = [
      { id: 1, fullName: 'Abc', isActive: true },
      { id: 3, fullName: 'Xyz', isActive: true },
    ];

    const actualUser = getAllActiveUsers(state);
    expect(actualUser).toEqual(expectedUsers);
  });
});

describe('getAllActiveUsersWithStatus', () => {
  test('return all active users with status object in it, get status from presence', () => {
    const state = {
      users: [
        { id: 1, fullName: 'Abc', isActive: true, email: 'a@a.com' },
        { id: 2, fullName: 'Def', isActive: false, email: 'd@a.com' },
        { id: 3, fullName: 'Xyz', isActive: true, email: 'x@a.com' },
        { id: 4, fullName: 'Joe', isActive: true, email: 'j@a.com' },
      ],
      presence: [
        { email: 'a@a.com', status: 'active', timestamp: 123 },
        { email: 'd@a.com', status: 'idle', timestamp: 456 },
        { email: 'x@a.com', status: 'idle', timestamp: 789 },
      ],
    };
    deepFreeze(state);
    const expectedUsers = [
      { id: 1, fullName: 'Abc', status: 'active', email: 'a@a.com', isActive: true },
      { id: 3, fullName: 'Xyz', status: 'idle', email: 'x@a.com', isActive: true },
      { id: 4, fullName: 'Joe', status: undefined, email: 'j@a.com', isActive: true },
    ];

    const actualUser = getAllActiveUsersWithStatus(state);
    expect(actualUser).toEqual(expectedUsers);
  });
});
