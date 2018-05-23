import deepFreeze from 'deep-freeze';

import {
  getAccountDetailsUser,
  getActiveUsers,
  getUsersStatusActive,
  getUsersStatusIdle,
  getUsersStatusOffline,
  getUsersByEmail,
  getUsersById,
  getUsersSansMe,
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
    const expectedUser = {
      email: 'b@a.com',
      full_name: 'b@a.com',
      avatar_url: '',
      timezone: '',
      user_id: -1,
      is_active: false,
      is_admin: false,
      is_bot: false,
    };

    const actualUser = getAccountDetailsUser(state);

    expect(actualUser).toEqual(expectedUser);
  });
});

describe('getActiveUsers', () => {
  test('return all active users from state', () => {
    const state = deepFreeze({
      users: [
        { full_name: 'Abc', is_active: true },
        { full_name: 'Def', is_active: false },
        { full_name: 'Xyz', is_active: true },
      ],
    });
    const expectedUsers = [
      { full_name: 'Abc', is_active: true },
      { full_name: 'Xyz', is_active: true },
    ];

    const actualUser = getActiveUsers(state);

    expect(actualUser).toEqual(expectedUsers);
  });
});

describe('getUsersStatusActive', () => {
  test('returns users with presence status set as "active"', () => {
    const state = deepFreeze({
      users: [
        { email: 'abc@example.com', is_active: true },
        { email: 'def@example.com', is_active: true },
        { email: 'xyz@example.com', is_active: true },
      ],
      presence: {
        'abc@example.com': {
          aggregated: {
            status: 'active',
          },
        },
      },
    });
    const expectedUsers = [{ email: 'abc@example.com', is_active: true }];

    const actualUser = getUsersStatusActive(state);

    expect(actualUser).toEqual(expectedUsers);
  });
});

describe('getUsersStatusIdle', () => {
  test('returns users with presence status set as "idle"', () => {
    const state = deepFreeze({
      users: [
        { email: 'abc@example.com', is_active: true },
        { email: 'def@example.com', is_active: true },
        { email: 'xyz@example.com', is_active: true },
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
      { email: 'abc@example.com', is_active: true },
      { email: 'def@example.com', is_active: true },
    ];

    const actualUser = getUsersStatusIdle(state);

    expect(actualUser).toEqual(expectedUsers);
  });
});

describe('getUsersStatusOffline', () => {
  test('returns users with presence status set as "offline"', () => {
    const state = deepFreeze({
      users: [
        { email: 'abc@example.com', is_active: true },
        { email: 'def@example.com', is_active: true },
        { email: 'xyz@example.com', is_active: true },
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
      { email: 'abc@example.com', is_active: true },
      { email: 'def@example.com', is_active: true },
      { email: 'xyz@example.com', is_active: true },
    ];

    const actualUser = getUsersStatusOffline(state);

    expect(actualUser).toEqual(expectedUsers);
  });
});

describe('getUsersByEmail', () => {
  test('return users mapped by their email', () => {
    const state = deepFreeze({
      users: [
        { email: 'abc@example.com' },
        { email: 'def@example.com' },
        { email: 'xyz@example.com' },
      ],
      realm: {
        crossRealmBots: [],
        nonActiveUsers: [],
      },
    });
    const expectedResult = {
      'abc@example.com': { email: 'abc@example.com' },
      'def@example.com': { email: 'def@example.com' },
      'xyz@example.com': { email: 'xyz@example.com' },
    };

    const result = getUsersByEmail(state);

    expect(result).toEqual(expectedResult);
  });
});

describe('getUsersById', () => {
  test('return users mapped by their Id', () => {
    const state = deepFreeze({
      users: [
        { user_id: 1, email: 'abc@example.com' },
        { user_id: 2, email: 'def@example.com' },
        { user_id: 3, email: 'xyz@example.com' },
      ],
    });
    const expectedResult = {
      1: { user_id: 1, email: 'abc@example.com' },
      2: { user_id: 2, email: 'def@example.com' },
      3: { user_id: 3, email: 'xyz@example.com' },
    };

    const result = getUsersById(state);

    expect(result).toEqual(expectedResult);
  });
});

describe('getUsersSansMe', () => {
  test('returns all users except current user', () => {
    const state = deepFreeze({
      users: [
        { email: 'me@example.com' },
        { email: 'john@example.com' },
        { email: 'doe@example.com' },
      ],
      accounts: [{ email: 'me@example.com' }],
    });
    const expectedResult = [{ email: 'john@example.com' }, { email: 'doe@example.com' }];

    const actualResult = getUsersSansMe(state);

    expect(actualResult).toEqual(expectedResult);
  });
});
