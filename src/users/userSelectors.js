/* @flow */
import { createSelector } from 'reselect';

import { NULL_USER } from '../nullObjects';
import { getActiveUsers, getNonActiveUsers } from '../directSelectors';
import { getOwnEmail } from '../account/accountSelectors';
import { getUserByEmail } from './userHelpers';

export const getSelfUserDetail = createSelector(getActiveUsers, getOwnEmail, (users, ownEmail) =>
  getUserByEmail(users, ownEmail),
);

export const getSortedUsers = createSelector(getActiveUsers, users =>
  [...users].sort((x1, x2) => x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase())),
);

export const getUsers = createSelector(getActiveUsers, (users = []) => users);

export const getAllUsers = createSelector(
  getActiveUsers,
  getNonActiveUsers,
  (users = [], nonActiveUsers = []) => [...users, ...nonActiveUsers],
);

export const getAllUsersByEmail = createSelector(getAllUsers, allUsers =>
  allUsers.reduce((usersByEmail, user) => {
    usersByEmail[user.email] = user;
    return usersByEmail;
  }, {}),
);

export const getUsersById = createSelector(getActiveUsers, (users = []) =>
  users.reduce((usersById, user) => {
    usersById[user.user_id] = user;
    return usersById;
  }, {}),
);

export const getUsersSansMe = createSelector(getActiveUsers, getOwnEmail, (users, ownEmail) =>
  users.filter(user => user.email !== ownEmail),
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
