/* @flow */
import uniqby from 'lodash.uniqby';

import { NOT_FOUND_USER } from '../constants';
import type { UserType } from '../types';

const statusOrder = (status) => {
  switch (status) {
    case 'active': return 1;
    case 'idle': return 2;
    case 'offline': return 3;
    default: return 4;
  }
};

export const getUserById = (users: any[], userId: number) =>
  users.find(user => user.id === userId) || NOT_FOUND_USER;

export const groupUsersByInitials = (users: any[]): Object =>
  users.reduce((accounts, x) => {
    const firstLetter = x.fullName[0].toUpperCase();
    if (!accounts[firstLetter]) {
      accounts[firstLetter] = []; // eslint-disable-line
    }
    accounts[firstLetter].push(x);
    return accounts;
  }, {});

export const sortUserList = (users: any[]): UserType[] =>
  users.sort((x1, x2) =>
    statusOrder(x1.status) - statusOrder(x2.status) ||
    x1.fullName.toLowerCase().localeCompare(x2.fullName.toLowerCase())
  );

export const filterUserList = (users: any[], filter: string = '', ownEmail: ?string): any[] =>
  users.filter(user =>
    user.email !== ownEmail &&
    (filter === '' ||
    user.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    user.email.toLowerCase().includes(filter.toLowerCase()))
  );

export const sortAlphabetically = (users: UserType[]): UserType[] =>
  users.sort((x1, x2) =>
    x1.fullName.toLowerCase().localeCompare(x2.fullName.toLowerCase())
  );

export const filterUserStartWith = (users: UserType[], filter: string = '', ownEmail: string): UserType[] =>
  users.filter(user =>
    user.email !== ownEmail &&
    user.fullName.toLowerCase().startsWith(filter.toLowerCase())
  );

export const filterUserByInitials = (users: UserType[], filter: string = '', ownEmail: string): UserType[] =>
  users.filter(user =>
    user.email !== ownEmail &&
    user.fullName.replace(/(\s|[a-z])/g, '').toLowerCase().startsWith(filter.toLowerCase())
  );

export const filterUserThatContains = (users: UserType[], filter: string = '', ownEmail: string): UserType[] =>
  users.filter(user =>
    user.email !== ownEmail &&
    user.fullName.toLowerCase().includes(filter.toLowerCase())
  );

export const filterUserMatchesEmail = (users: UserType[], filter: string = '', ownEmail: string): UserType[] =>
  users.filter(user =>
    user.email !== ownEmail &&
    user.email.toLowerCase().includes(filter.toLowerCase())
  );

export const getUniqueUsers = (users: UserType[]): UserType[] =>
  uniqby(users, 'email');

export const getAutocompleteSuggestion = (users: UserType[], filter: string = '', ownEmail: string): UserType[] => {
  const startWith = filterUserStartWith(users, filter, ownEmail);
  const initials = filterUserByInitials(users, filter, ownEmail);
  const contains = filterUserThatContains(users, filter, ownEmail);
  const matchesEmail = filterUserMatchesEmail(users, filter, ownEmail);
  return getUniqueUsers([...startWith, ...initials, ...contains, ...matchesEmail]);
};
