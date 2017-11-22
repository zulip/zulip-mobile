import deepFreeze from 'deep-freeze';

import {
  getAccountDetailsUser,
  getActiveUsers,
  getUsersStatusActive,
  getUsersStatusIdle,
  getUsersStatusOffline,
} from '../userSelectors';

describe('getAccountDetailsUser', () => {
  test('return user for the account details screen', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
      users: [{ firstName: 'a', email: 'a@a.com' }, { firstName: 'b', email: 'b@a.com' }],
    });
    const expectedUser = { firstName: 'b', email: 'b@a.com' };

    const actualUser = getAccountDetailsUser(state);

    expect(actualUser).toEqual(expectedUser);
  });

  test('if user does not exist return a user with the same email and no details', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [
          { routeName: 'first', params: { email: 'a@a.com' } },
          { routeName: 'second', params: { email: 'b@a.com' } },
        ],
      },
      users: [],
    });
    const expectedUser = { email: 'b@a.com', fullName: 'b@a.com', avatarUrl: '' };

    const actualUser = getAccountDetailsUser(state);

    expect(actualUser).toEqual(expectedUser);
  });
});

describe('getActiveUsers', () => {
  test('return all active users from state', () => {
    const state = deepFreeze({
      users: [
        { id: 1, fullName: 'Abc', isActive: true },
        { id: 2, fullName: 'Def', isActive: false },
        { id: 3, fullName: 'Xyz', isActive: true },
      ],
    });
    const expectedUsers = [
      { id: 1, fullName: 'Abc', isActive: true },
      { id: 3, fullName: 'Xyz', isActive: true },
    ];

    const actualUser = getActiveUsers(state);

    expect(actualUser).toEqual(expectedUsers);
  });
});

describe('getUsersStatusActive', () => {
  test('returns users with presence status set as "active"', () => {
    const state = deepFreeze({
      users: [
        { id: 1, email: 'abc@example.com', isActive: true },
        { id: 2, email: 'def@example.com', isActive: true },
        { id: 3, email: 'xyz@example.com', isActive: true },
      ],
      presence: {
        'abc@example.com': {
          aggregated: {
            status: 'active',
          },
        },
      },
    });
    const expectedUsers = [{ id: 1, email: 'abc@example.com', isActive: true }];

    const actualUser = getUsersStatusActive(state);

    expect(actualUser).toEqual(expectedUsers);
  });
});

describe('getUsersStatusIdle', () => {
  test('returns users with presence status set as "idle"', () => {
    const state = deepFreeze({
      users: [
        { id: 1, email: 'abc@example.com', isActive: true },
        { id: 2, email: 'def@example.com', isActive: true },
        { id: 3, email: 'xyz@example.com', isActive: true },
      ],
      presence: {
        'abc@example.com': {
          aggregated: {
            status: 'idle',
          },
        },
        'def@example.com': {
          aggregated: {
            status: 'idle',
          },
        },
      },
    });
    const expectedUsers = [
      { id: 1, email: 'abc@example.com', isActive: true },
      { id: 2, email: 'def@example.com', isActive: true },
    ];

    const actualUser = getUsersStatusIdle(state);

    expect(actualUser).toEqual(expectedUsers);
  });
});

describe('getUsersStatusOffline', () => {
  test('returns users with presence status set as "offline"', () => {
    const state = deepFreeze({
      users: [
        { id: 1, email: 'abc@example.com', isActive: true },
        { id: 2, email: 'def@example.com', isActive: true },
        { id: 3, email: 'xyz@example.com', isActive: true },
      ],
      presence: {
        'abc@example.com': {
          aggregated: {
            status: 'offline',
          },
        },
        'def@example.com': {
          aggregated: {
            status: 'offline',
          },
        },
        'xyz@example.com': {
          aggregated: {
            status: 'offline',
          },
        },
      },
    });
    const expectedUsers = [
      { id: 1, email: 'abc@example.com', isActive: true },
      { id: 2, email: 'def@example.com', isActive: true },
      { id: 3, email: 'xyz@example.com', isActive: true },
    ];

    const actualUser = getUsersStatusOffline(state);

    expect(actualUser).toEqual(expectedUsers);
  });
});
