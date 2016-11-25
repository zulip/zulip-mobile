import { sortUserList, filterUserList } from '../userListSelectors';

test('empty input to filterUserList results in empty list', () => {
  const users = [];
  const filteredUsers = filterUserList(users, 'some filter');
  expect(filteredUsers).toEqual([]);
});

test('filterUserList returns same list if no filter', () => {
  const users = [{ email: 'user1@example.com' }, { email: 'user2@example.com' }];
  const filteredUsers = filterUserList(users);
  expect(filteredUsers).toEqual(users);
});

test('filterUserList filters out user\'s own entry', () => {
  const users = [{ email: 'email@example.com' }, { email: 'my@example.com' }];
  const shouldMatch = [{ email: 'email@example.com' }];
  const filteredUsers = filterUserList(users, '', 'my@example.com');
  expect(filteredUsers).toEqual(shouldMatch);
});

test('filterUserList searches in name, email and is case insensitive', () => {
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

test('sortUserList sorts by name', () => {
  const users = [{ fullName: 'abc' }, { fullName: 'xyz' }, { fullName: 'jkl' }];
  const shouldMatch = [{ fullName: 'abc' }, { fullName: 'jkl' }, { fullName: 'xyz' }];
  const sortedUsers = sortUserList(users);
  expect(sortedUsers).toEqual(shouldMatch);
});

test('sortUserList prioritizes status', () => {
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
