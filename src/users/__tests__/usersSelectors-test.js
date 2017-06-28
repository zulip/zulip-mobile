import {
  sortUserList,
  filterUserList,
  getAutocompleteSuggestion,
  groupUsersByInitials,
} from '../usersSelectors';

describe('filterUserList', () => {
  test('empty input results in empty list', () => {
    const users = [];
    const filteredUsers = filterUserList(users, 'some filter');
    expect(filteredUsers).toEqual([]);
  });

  test('returns same list if no filter', () => {
    const users = [{ email: 'user1@example.com' }, { email: 'user2@example.com' }];
    const filteredUsers = filterUserList(users);
    expect(filteredUsers).toEqual(users);
  });

  test('filters out user\'s own entry', () => {
    const users = [{ email: 'email@example.com' }, { email: 'my@example.com' }];
    const shouldMatch = [{ email: 'email@example.com' }];
    const filteredUsers = filterUserList(users, '', 'my@example.com');
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('searches in name, email and is case insensitive', () => {
    const allUsers = [
      { fullName: 'match', email: 'any@example.com' },
      { fullName: 'partial match', email: 'any@example.com' },
      { fullName: 'Case Insensitive MaTcH', email: 'any@example.com' },
      { fullName: 'Any Name', email: 'match@example.com' },
      { fullName: 'some name', email: 'another@example.com' },
    ];
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
    const users = [];
    const filteredUsers = getAutocompleteSuggestion(users, 'some filter');
    expect(filteredUsers).toEqual([]);
  });

  test('filters out user\'s own entry', () => {
    const users = [
      { email: 'email@example.com', fullName: 'Some Guy' },
      { email: 'my@example.com', fullName: 'Me' },
    ];
    const shouldMatch = [{ email: 'email@example.com', fullName: 'Some Guy' }];
    const filteredUsers = getAutocompleteSuggestion(users, '', 'my@example.com');
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('searches in name, email and is case insensitive', () => {
    const allUsers = [
      { fullName: 'match', email: 'any@example.com' },
      { fullName: 'match this', email: 'any@example.com' },
      { fullName: 'MaTcH Case Insensitive', email: 'any@example.com' },
      { fullName: 'some name', email: 'another@example.com' },
      { fullName: 'Example', email: 'match@example.com' },
    ];
    const shouldMatch = [
      { fullName: 'match', email: 'any@example.com' },
      { fullName: 'match this', email: 'any@example.com' },
      { fullName: 'MaTcH Case Insensitive', email: 'any@example.com' },
      { fullName: 'Example', email: 'match@example.com' },
    ];
    const filteredUsers = getAutocompleteSuggestion(allUsers, 'match');
    expect(filteredUsers).toEqual(shouldMatch);
  });

  test('result should be in priority of startsWith, initials, contains in name, matches in email', () => {
    const allUsers = [
      { fullName: 'M Apple', email: 'any@example.com' },
      { fullName: 'Normal boy', email: 'any@example.com' },
      { fullName: 'Example', email: 'match@example.com' },
      { fullName: 'match', email: 'any@example.com' },
    ];
    const shouldMatch = [
      { fullName: 'match', email: 'any@example.com' },   // name starts with 'ma'
      { fullName: 'M Apple', email: 'any@example.com' }, // initials 'MA'
      { fullName: 'Normal boy', email: 'any@example.com' }, // name contains in 'ma'
      { fullName: 'Example', email: 'match@example.com' }, // email contains 'ma'
    ];
    const filteredUsers = getAutocompleteSuggestion(allUsers, 'ma');
    expect(filteredUsers).toEqual(shouldMatch);
  });
});

describe('sortUserList', () => {
  test('sorts list by name', () => {
    const users = [{ fullName: 'abc' }, { fullName: 'xyz' }, { fullName: 'jkl' }];
    const shouldMatch = [{ fullName: 'abc' }, { fullName: 'jkl' }, { fullName: 'xyz' }];
    const sortedUsers = sortUserList(users);
    expect(sortedUsers).toEqual(shouldMatch);
  });

  test('prioritizes status', () => {
    const users = [
      { fullName: 'abc', status: 'offline' },
      { fullName: 'xyz', status: 'idle' },
      { fullName: 'jkl', status: 'active' },
      { fullName: 'abc', status: 'active' },
    ];
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
    const users = [];
    const groupedUsers = groupUsersByInitials(users);
    expect(groupedUsers).toEqual({});
  });

  test('empty input results in empty list', () => {
    const users = [
      { fullName: 'Allen' },
      { fullName: 'Bob Tester' },
      { fullName: 'bob bob' },
    ];
    const groupedUsers = groupUsersByInitials(users);
    expect(groupedUsers).toEqual({
      'A': [{ fullName: 'Allen' }],
      'B': [
        { fullName: 'Bob Tester' },
        { fullName: 'bob bob' },
      ],
    });
  });
});
