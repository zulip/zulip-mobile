/* @flow strict-local */
import {
  getAllUsersByEmail,
  getAllUsersById,
  getUsersById,
  getUserForId,
  getUserIsActive,
} from '../userSelectors';
import * as eg from '../../__tests__/lib/exampleData';

describe('getAllUsersByEmail', () => {
  test('return users mapped by their email', () => {
    const users = [eg.makeUser(), eg.makeUser(), eg.makeUser()];
    const state = eg.reduxState({ users });
    expect(getAllUsersByEmail(state)).toEqual(new Map(users.map(u => [u.email, u])));
  });

  test('return users, bots, and inactive users mapped by their email', () => {
    const state = eg.reduxState({
      users: [eg.selfUser],
      realm: {
        ...eg.baseReduxState.realm,
        crossRealmBots: [eg.crossRealmBot],
        nonActiveUsers: [eg.otherUser],
      },
    });
    expect(getAllUsersByEmail(state)).toEqual(
      new Map([
        [eg.selfUser.email, eg.selfUser],
        [eg.crossRealmBot.email, eg.crossRealmBot],
        [eg.otherUser.email, eg.otherUser],
      ]),
    );
  });

  test('empty state does not cause an exception, returns an empty object', () => {
    expect(getAllUsersByEmail(eg.reduxState())).toEqual(new Map());
  });
});

describe('getAllUsersById', () => {
  test('return users mapped by their id', () => {
    const users = [eg.makeUser(), eg.makeUser(), eg.makeUser()];
    const state = eg.reduxState({ users });
    expect(getAllUsersById(state)).toEqual(new Map(users.map(u => [u.user_id, u])));
  });

  test('return users, bots, and inactive users mapped by their id', () => {
    const state = eg.reduxState({
      users: [eg.selfUser],
      realm: {
        ...eg.baseReduxState.realm,
        crossRealmBots: [eg.crossRealmBot],
        nonActiveUsers: [eg.otherUser],
      },
    });
    expect(getAllUsersById(state)).toEqual(
      new Map([
        [eg.selfUser.user_id, eg.selfUser],
        [eg.crossRealmBot.user_id, eg.crossRealmBot],
        [eg.otherUser.user_id, eg.otherUser],
      ]),
    );
  });

  test('empty state does not cause an exception, returns an empty object', () => {
    expect(getAllUsersById(eg.reduxState())).toEqual(new Map());
  });
});

describe('getUsersById', () => {
  test('return users mapped by their Id', () => {
    const users = [eg.makeUser(), eg.makeUser(), eg.makeUser()];
    const state = eg.reduxState({ users });
    expect(getUsersById(state)).toEqual(new Map(users.map(u => [u.user_id, u])));
  });
});

describe('getUserForId', () => {
  const state = eg.reduxState({
    users: [eg.selfUser],
    realm: {
      ...eg.baseReduxState.realm,
      crossRealmBots: [eg.crossRealmBot],
      nonActiveUsers: [eg.makeUser(), eg.makeUser()],
    },
  });

  test('returns the user if it has not been deactivated', () => {
    expect(getUserForId(state, state.users[0].user_id)).toEqual(state.users[0]);
  });

  test('returns the user if it has been deactivated', () => {
    expect(getUserForId(state, state.realm.nonActiveUsers[0].user_id)).toEqual(
      state.realm.nonActiveUsers[0],
    );
  });

  test('returns the user if it is a cross realm bot', () => {
    expect(getUserForId(state, state.realm.crossRealmBots[0].user_id)).toEqual(
      state.realm.crossRealmBots[0],
    );
  });
});

describe('getUserIsActive', () => {
  const state = eg.reduxState({
    users: [eg.selfUser],
    realm: {
      ...eg.baseReduxState.realm,
      crossRealmBots: [eg.crossRealmBot],
      nonActiveUsers: [eg.makeUser(), eg.makeUser()],
    },
  });

  test('returns false for a user that has been deactivated', () => {
    expect(getUserIsActive(state, state.realm.nonActiveUsers[0].user_id)).toBeFalse();
  });

  test('returns true for a user that has not been deactivated', () => {
    expect(getUserIsActive(state, state.users[0].user_id)).toBeTrue();
  });

  test('returns true for a cross realm bot', () => {
    expect(getUserIsActive(state, state.realm.crossRealmBots[0].user_id)).toBeTrue();
  });
});
