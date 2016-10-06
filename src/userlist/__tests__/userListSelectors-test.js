import { fromJS } from 'immutable';
import { sortUserList, filterUserList } from '../userListSelectors';

it('empty input to filterUserList results in empty list', () => {
  const users = fromJS([]);
  const filteredUsers = filterUserList(users, 'some filter');
  expect(filteredUsers).toEqual(fromJS([]));
});

it('filterUserList returns same list if no filter', () => {
  const users = fromJS([{ fullName: 'user1' }, { fullName: 'user2' }]);
  const filteredUsers = filterUserList(users);
  expect(filteredUsers).toEqual(users);
});

it('filterUserList searches in name, email and is case insensitive', () => {
  const allUsers = fromJS([
    { fullName: 'match', email: 'any@email.com' },
    { fullName: 'partial match', email: 'any@email.com' },
    { fullName: 'Case Insensitive MaTcH', email: 'any@email.com' },
    { fullName: 'Any Name', email: 'match@email.com' },
    { fullName: 'some name', email: 'another@email.com' },
  ]);
  const shouldMatch = fromJS([
    { fullName: 'match', email: 'any@email.com' },
    { fullName: 'partial match', email: 'any@email.com' },
    { fullName: 'Case Insensitive MaTcH', email: 'any@email.com' },
    { fullName: 'Any Name', email: 'match@email.com' },
  ]);
  const filteredUsers = filterUserList(allUsers, 'match');
  expect(filteredUsers).toEqual(shouldMatch);
});

it('sortUserList sorts by name', () => {
  const users = fromJS([{ fullName: 'abc' }, { fullName: 'xyz' }, { fullName: 'jkl' }]);
  const shouldMatch = fromJS([{ fullName: 'abc' }, { fullName: 'jkl' }, { fullName: 'xyz' }]);
  const sortedUsers = sortUserList(users);
  expect(sortedUsers).toEqual(shouldMatch);
});

it('sortUserList prioritizes status', () => {
  const users = fromJS([
    { fullName: 'abc', status: 'offline' },
    { fullName: 'xyz', status: 'idle' },
    { fullName: 'jkl', status: 'active' },
    { fullName: 'abc', status: 'active' },
  ]);
  const shouldMatch = fromJS([
    { fullName: 'abc', status: 'active' },
    { fullName: 'jkl', status: 'active' },
    { fullName: 'xyz', status: 'idle' },
    { fullName: 'abc', status: 'offline' },
  ]);
  const sortedUsers = sortUserList(users);
  expect(sortedUsers).toEqual(shouldMatch);
});
