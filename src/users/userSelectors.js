/* @flow */
import { createSelector } from 'reselect';

import { NULL_USER } from '../nullObjects';
import { getPresence, getUsers } from '../directSelectors';
import { getOwnEmail } from '../account/accountSelectors';
import { getUserByEmail } from './userHelpers';

export const getAccountDetailsUser = (email: string) =>
  createSelector([getUsers], allUsers => {
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

export const getSelfUserDetail = createSelector(getUsers, getOwnEmail, (users, ownEmail) =>
  getUserByEmail(users, ownEmail),
);

export const getActiveUsers = createSelector(getUsers, users =>
  users.filter(user => user.is_active),
);

export const getSortedUsers = createSelector(getUsers, users =>
  [...users].sort((x1, x2) => x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase())),
);

export const getUsersStatusActive = createSelector(getActiveUsers, getPresence, (users, presence) =>
  users.filter(user => presence[user.email] && presence[user.email].aggregated.status === 'active'),
);

export const getUsersStatusIdle = createSelector(getActiveUsers, getPresence, (users, presence) =>
  users.filter(user => presence[user.email] && presence[user.email].aggregated.status === 'idle'),
);

export const getUsersStatusOffline = createSelector(
  getActiveUsers,
  getPresence,
  (users, presence) =>
    users.filter(
      user => presence[user.email] && presence[user.email].aggregated.status === 'offline',
    ),
);

export const getUsersByEmail = createSelector(getUsers, users =>
  users.reduce((usersByEmail, user) => {
    usersByEmail[user.email] = user;
    return usersByEmail;
  }, {}),
);

export const getUsersById = createSelector(getUsers, (users = []) =>
  users.reduce((usersById, user) => {
    usersById[user.user_id] = user;
    return usersById;
  }, {}),
);

export const getUsersSansMe = createSelector(getUsers, getOwnEmail, (users, ownEmail) =>
  users.filter(user => user.email !== ownEmail),
);
