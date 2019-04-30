import deepFreeze from 'deep-freeze';

import {
  getAccountDetailsUserForEmail,
  getActiveUsersByEmail,
  getAllUsersByEmail,
  getUsersById,
  getUsersSansMe,
} from '../userSelectors';
import { eg } from '../../__tests__/exampleData';

describe('getAccountDetailsUserForEmail', () => {
  test('return user for the account details screen', () => {
    const state = eg.reduxState({
      users: [eg.selfUser, eg.otherUser],
    });
    expect(getAccountDetailsUserForEmail(state, eg.otherUser.email)).toEqual(eg.otherUser);
  });

  test('if user does not exist return a user with the same email and no details', () => {
    const state = eg.reduxState();
    expect(getAccountDetailsUserForEmail(state, 'b@a.com')).toEqual({
      email: 'b@a.com',
      full_name: 'b@a.com',
      avatar_url: '',
      timezone: '',
      user_id: -1,
      is_admin: false,
      is_bot: false,
    });
  });
});

describe('getActiveUsers', () => {
  test('return users, bots, map by email and do not include inactive users', () => {
    const state = deepFreeze({
      users: [{ email: 'abc@example.com' }],
      realm: {
        crossRealmBots: [{ email: 'def@example.com' }],
        nonActiveUsers: [{ email: 'xyz@example.com' }],
      },
    });
    const expectedResult = new Map([
      ['abc@example.com', { email: 'abc@example.com' }],
      ['def@example.com', { email: 'def@example.com' }],
    ]);

    const result = getActiveUsersByEmail(state);

    expect(result).toEqual(expectedResult);
  });
});

describe('getAllUsersByEmail', () => {
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
    const expectedResult = new Map([
      ['abc@example.com', { email: 'abc@example.com' }],
      ['def@example.com', { email: 'def@example.com' }],
      ['xyz@example.com', { email: 'xyz@example.com' }],
    ]);

    const result = getAllUsersByEmail(state);

    expect(result).toEqual(expectedResult);
  });

  test('return users, bots, and inactive users mapped by their email', () => {
    const state = deepFreeze({
      users: [{ email: 'abc@example.com' }],
      realm: {
        crossRealmBots: [{ email: 'def@example.com' }],
        nonActiveUsers: [{ email: 'xyz@example.com' }],
      },
    });
    const expectedResult = new Map([
      ['abc@example.com', { email: 'abc@example.com' }],
      ['def@example.com', { email: 'def@example.com' }],
      ['xyz@example.com', { email: 'xyz@example.com' }],
    ]);

    const result = getAllUsersByEmail(state);

    expect(result).toEqual(expectedResult);
  });

  test('empty state does not cause an exception, returns an empty object', () => {
    const state = deepFreeze({
      realm: {},
    });
    const expectedResult = new Map();

    const result = getAllUsersByEmail(state);

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
    const expectedResult = new Map([
      [1, { user_id: 1, email: 'abc@example.com' }],
      [2, { user_id: 2, email: 'def@example.com' }],
      [3, { user_id: 3, email: 'xyz@example.com' }],
    ]);

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
