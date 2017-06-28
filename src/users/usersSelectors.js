/* @flow */
import { UserType } from '../types';

const statusOrder = (status) => {
  switch (status) {
    case 'active': return 1;
    case 'idle': return 2;
    case 'offline': return 3;
    default: return 4;
  }
};

export const getUserById = (users: any[], userId: number) =>
  users.find(user => user.id === userId);

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

export const alphabeticallySort = (users: any[]): UserType[] =>
  users.sort((x1, x2) =>
    x1.fullName.toLowerCase().localeCompare(x2.fullName.toLowerCase())
  );

export const getAutocompleteSuggestion = (users: any[], filter: string = '', ownEmail: string) => {
  let startWith = [];
  let initials = [];
  let contains = [];
  let matchesEmail = [];
  users.map((user) => {
    if (user.email === ownEmail) return user;
    else if (user.fullName.toLowerCase().startsWith(filter.toLowerCase())) {
      startWith = [...startWith, user];
      return user;
    } else if (user.fullName.replace(/(\s|[a-z])/g, '').toLowerCase().startsWith(filter.toLowerCase())) {
      initials = [...initials, user];
      return user;
    } else if (user.fullName.toLowerCase().includes(filter.toLowerCase())) {
      contains = [...contains, user];
      return user;
    } else if (user.email.toLowerCase().includes(filter.toLowerCase())) {
      matchesEmail = [...matchesEmail, user];
      return user;
    } else return user;
  });
  return [...startWith, ...initials, ...contains, ...matchesEmail];
};
