/* @flow strict-local */
import { createSelector } from 'reselect';

import type { GlobalState, UserOrBot, Selector, User } from '../types';
import { NULL_USER } from '../nullObjects';
import { getUsers, getCrossRealmBots, getNonActiveUsers } from '../directSelectors';
import { getOwnEmail } from '../account/accountsSelectors';

export const getSortedUsers: Selector<User[]> = createSelector(getUsers, users =>
  [...users].sort((x1, x2) => x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase())),
);

export const getActiveUsersByEmail: Selector<Map<string, UserOrBot>> = createSelector(
  getUsers,
  getCrossRealmBots,
  (users = [], crossRealmBots = []) =>
    new Map([...users, ...crossRealmBots].map(user => [user.email, user])),
);

const getAllUsers: Selector<UserOrBot[]> = createSelector(
  getUsers,
  getNonActiveUsers,
  getCrossRealmBots,
  (users = [], nonActiveUsers = [], crossRealmBots = []) => [
    ...users,
    ...nonActiveUsers,
    ...crossRealmBots,
  ],
);

export const getUsersById: Selector<Map<number, User>> = createSelector(
  getUsers,
  (users = []) => new Map(users.map(user => [user.user_id, user])),
);

export const getUsersByEmail: Selector<Map<string, User>> = createSelector(
  getUsers,
  (users = []) => new Map(users.map(user => [user.email, user])),
);

export const getAllUsersByEmail: Selector<Map<string, UserOrBot>> = createSelector(
  getAllUsers,
  allUsers => new Map(allUsers.map(user => [user.email, user])),
);

export const getSelfUserDetail = (state: GlobalState): User =>
  getUsersByEmail(state).get(getOwnEmail(state)) || NULL_USER;

export const getUsersSansMe: Selector<User[]> = createSelector(
  getUsers,
  getOwnEmail,
  (users, ownEmail) => users.filter(user => user.email !== ownEmail),
);

export const getAccountDetailsUserForEmail: Selector<UserOrBot, string> = createSelector(
  (state, email) => email,
  state => getAllUsersByEmail(state),
  (email, allUsersByEmail) => {
    if (!email) {
      return NULL_USER;
    }

    return (
      allUsersByEmail.get(email) || {
        ...NULL_USER,
        email,
        full_name: email,
      }
    );
  },
);
