/* @flow strict-local */
import { createSelector } from 'reselect';

import type { RealmBot, Selector, User, UserIdMap } from '../types';
import { NULL_USER } from '../nullObjects';
import { getUsers, getCrossRealmBots, getNonActiveUsers } from '../directSelectors';
import { getOwnEmail } from '../account/accountsSelectors';
import { getUserByEmail } from './userHelpers';

export const getSelfUserDetail: Selector<User> = createSelector(
  getUsers,
  getOwnEmail,
  (users, ownEmail) => getUserByEmail(users, ownEmail),
);

export const getSortedUsers: Selector<User[]> = createSelector(getUsers, users =>
  [...users].sort((x1, x2) => x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase())),
);

export const getActiveUsers: Selector<(User | RealmBot)[]> = createSelector(
  getUsers,
  getCrossRealmBots,
  (users = [], crossRealmBots = []) => [...users, ...crossRealmBots],
);

export const getAllUsers: Selector<(User | RealmBot)[]> = createSelector(
  getUsers,
  getNonActiveUsers,
  getCrossRealmBots,
  (users = [], nonActiveUsers = [], crossRealmBots = []) => [
    ...users,
    ...nonActiveUsers,
    ...crossRealmBots,
  ],
);

export const getAllUsersByEmail = createSelector(getAllUsers, allUsers =>
  allUsers.reduce((usersByEmail, user) => {
    usersByEmail[user.email] = user;
    return usersByEmail;
  }, {}),
);

export const getUsersById: Selector<UserIdMap> = createSelector(getUsers, (users = []) =>
  users.reduce((usersById, user) => {
    usersById[user.user_id] = user;
    return usersById;
  }, {}),
);

export const getUsersSansMe: Selector<User[]> = createSelector(
  getUsers,
  getOwnEmail,
  (users, ownEmail) => users.filter(user => user.email !== ownEmail),
);

export const getAccountDetailsUserFromEmail = (email: string) =>
  createSelector(getAllUsers, allUsers => {
    if (!email) {
      return NULL_USER;
    }

    return (
      allUsers.find(x => x.email === email) || {
        ...NULL_USER,
        email,
        full_name: email,
      }
    );
  });
