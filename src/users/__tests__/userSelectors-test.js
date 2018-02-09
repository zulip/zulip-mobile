import deepFreeze from 'deep-freeze';

import {
  getAccountDetailsUser,
  getActiveUsers,
  getUsersStatusActive,
  getUsersStatusIdle,
  getUsersStatusOffline,
  getUsersByEmail,
  getUsersById,
} from '../userSelectors';

describe('getAccountDetailsUser', () => {
  test('return user for the account details screen', () => {
    const state = deepFreeze({
      nav: {
        index: 1,
        routes: [{ routeName: 'first' }, { routeName: 'second', params: { email: 'b@a.com' } }],
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
            timestamp: Date.now() - 10,
          },
        },
        'def@example.com': {
          aggregated: {
            status: 'active',
            timestamp: Date.now() / 1000 - 800,
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
            timestamp: Date.now() - 50,
          },
        },
        'def@example.com': {
          aggregated: {
            status: 'idle',
            timestamp: Date.now() - 90,
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
            timestamp: Date.now() - 90,
          },
        },
        'def@example.com': {
          aggregated: {
            status: 'offline',
            timestamp: Date.now() - 90,
          },
        },
        'xyz@example.com': {
          aggregated: {
            status: 'offline',
            timestamp: Date.now() - 90,
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

describe('getUsersByEmail', () => {
  test('return users mapped by their email', () => {
    const state = deepFreeze({
      users: [
        { id: 1, email: 'abc@example.com', isActive: true },
        { id: 2, email: 'def@example.com', isActive: true },
        { id: 3, email: 'xyz@example.com', isActive: true },
      ],
    });
    const expectedResult = {
      'abc@example.com': { id: 1, email: 'abc@example.com', isActive: true },
      'def@example.com': { id: 2, email: 'def@example.com', isActive: true },
      'xyz@example.com': { id: 3, email: 'xyz@example.com', isActive: true },
    };

    const result = getUsersByEmail(state);

    expect(result).toEqual(expectedResult);
  });
});

describe('getUsersById', () => {
  test('return users mapped by their Id', () => {
    const state = deepFreeze({
      users: [
        { id: 1, email: 'abc@example.com', isActive: true },
        { id: 2, email: 'def@example.com', isActive: true },
        { id: 3, email: 'xyz@example.com', isActive: true },
      ],
    });
    const expectedResult = {
      1: { id: 1, email: 'abc@example.com', isActive: true },
      2: { id: 2, email: 'def@example.com', isActive: true },
      3: { id: 3, email: 'xyz@example.com', isActive: true },
    };

    const result = getUsersById(state);

    expect(result).toEqual(expectedResult);
  });
});
