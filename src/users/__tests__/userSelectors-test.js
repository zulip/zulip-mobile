import deepFreeze from 'deep-freeze';

import { getAccountDetailsUser, getAllActiveUsers } from '../userSelectors';

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

  test('if user does not exist return a user with the same email and no details', () => {
    const state = {
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
      users: [],
    };
    deepFreeze(state);
    const expectedUser = { email: 'b@a.com', fullName: 'b@a.com', avatarUrl: '' };
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
