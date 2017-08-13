/* @flow */
import { createSelector } from 'reselect';
import uniqby from 'lodash.uniqby';

import { NULL_USER, NULL_PRESENCE } from '../nullObjects';
import type { User } from '../types';
import { getUsers, getPresence } from '../selectors';
import { getCurrentRouteParams } from '../nav/navigationSelectors';
import config from '../config';
import { getOwnEmail } from '../account/accountSelectors';

const statusOrder = status => {
  switch (status) {
    case 'active':
      return 1;
    case 'idle':
      return 2;
    case 'offline':
      return 3;
    default:
      return 4;
  }
};

export const getAccountDetailsUser = createSelector(
  [getUsers, getCurrentRouteParams],
  (allUsers, params) => {
    if (params && params.email) return allUsers.find(x => x.email === params.email) || NULL_USER;

    return NULL_USER;
  },
);

export const getUserByEmail = (users: any[], userEmail: string) =>
  users.find(user => user.email === userEmail) || NULL_USER;

export const getSelfUserDetail = createSelector(getUsers, getOwnEmail, (users, ownEmail) =>
  getUserByEmail(users, ownEmail),
);

export const getAllActiveUsers = createSelector(getUsers, allUsers =>
  allUsers.filter(user => user.isActive),
);

export const getAllActiveUsersWithStatus = createSelector(
  getAllActiveUsers,
  getPresence,
  (allUsers, allPresence) =>
    allUsers.reduce((users, user) => {
      let presence = allPresence.find(x => x.email === user.email) || NULL_PRESENCE;
      if (presence.age > config.offlineThresholdSecs) {
        presence = NULL_PRESENCE;
      }
      users.push({
        ...user,
        status: presence.status,
      });
      return users;
    }, []),
);

export const getUserById = (users: any[], userId: number) =>
  users.find(user => user.id === userId) || NULL_USER;

export const groupUsersByInitials = (users: any[]): Object =>
  users.reduce((accounts, x) => {
    const firstLetter = x.fullName[0].toUpperCase();
    if (!accounts[firstLetter]) {
      accounts[firstLetter] = []; // eslint-disable-line
    }
    accounts[firstLetter].push(x);
    return accounts;
  }, {});

export const sortUserList = (users: any[]): User[] =>
  [...users].sort(
    (x1, x2) =>
      statusOrder(x1.status) - statusOrder(x2.status) ||
      x1.fullName.toLowerCase().localeCompare(x2.fullName.toLowerCase()),
  );

export const filterUserList = (users: any[], filter: string = '', ownEmail: ?string): any[] =>
  users.length > 0
    ? users.filter(
        user =>
          user.email !== ownEmail &&
          (filter === '' ||
            user.fullName.toLowerCase().includes(filter.toLowerCase()) ||
            user.email.toLowerCase().includes(filter.toLowerCase())),
      )
    : users;

export const sortAlphabetically = (users: User[]): User[] =>
  [...users].sort((x1, x2) => x1.fullName.toLowerCase().localeCompare(x2.fullName.toLowerCase()));

export const filterUserStartWith = (users: User[], filter: string = '', ownEmail: string): User[] =>
  users.filter(
    user => user.email !== ownEmail && user.fullName.toLowerCase().startsWith(filter.toLowerCase()),
  );

export const filterUserByInitials = (
  users: User[],
  filter: string = '',
  ownEmail: string,
): User[] =>
  users.filter(
    user =>
      user.email !== ownEmail &&
      user.fullName.replace(/(\s|[a-z])/g, '').toLowerCase().startsWith(filter.toLowerCase()),
  );

export const filterUserThatContains = (
  users: User[],
  filter: string = '',
  ownEmail: string,
): User[] =>
  users.filter(
    user => user.email !== ownEmail && user.fullName.toLowerCase().includes(filter.toLowerCase()),
  );

export const filterUserMatchesEmail = (
  users: User[],
  filter: string = '',
  ownEmail: string,
): User[] =>
  users.filter(
    user => user.email !== ownEmail && user.email.toLowerCase().includes(filter.toLowerCase()),
  );

export const getUniqueUsers = (users: User[]): User[] => uniqby(users, 'email');

export const getAutocompleteSuggestion = (
  users: User[],
  filter: string = '',
  ownEmail: string,
): User[] => {
  if (users.length === 0) {
    return users;
  }

  const startWith = filterUserStartWith(users, filter, ownEmail);
  const initials = filterUserByInitials(users, filter, ownEmail);
  const contains = filterUserThatContains(users, filter, ownEmail);
  const matchesEmail = filterUserMatchesEmail(users, filter, ownEmail);
  return getUniqueUsers([...startWith, ...initials, ...contains, ...matchesEmail]);
};
