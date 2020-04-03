/* @flow strict-local */
import uniqby from 'lodash.uniqby';

import type { UserPresence, User, UserGroup, PresenceState } from '../types';
import { ensureUnreachable } from '../types';
import { NULL_USER } from '../nullObjects';
import { statusFromPresence } from '../utils/presence';

type UsersByStatus = {|
  active: User[],
  idle: User[],
  offline: User[],
  unavailable: User[],
|};

export const groupUsersByStatus = (users: User[], presences: PresenceState): UsersByStatus => {
  const groupedUsers = { active: [], idle: [], offline: [], unavailable: [] };
  users.forEach(user => {
    const status = statusFromPresence(presences[user.email]);
    groupedUsers[status].push(user);
  });
  return groupedUsers;
};

const statusOrder = (presence: UserPresence): number => {
  const status = statusFromPresence(presence);
  switch (status) {
    case 'active':
      return 1;
    case 'idle':
      return 2;
    case 'offline':
      return 3;
    default:
      ensureUnreachable(status);
      return 4;
  }
};

export const sortAlphabetically = (users: User[]): User[] =>
  [...users].sort((x1, x2) => x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase()));

export const filterUserStartWith = (users: User[], filter: string = ''): User[] =>
  users.filter(user => user.full_name.toLowerCase().startsWith(filter.toLowerCase()));

export const filterUserEmailStartWith = (users: User[], filter: string = ''): User[] =>
  users.filter(user => user.email.toLowerCase().startsWith(filter.toLowerCase()));

export const filterUserByInitials = (users: User[], filter: string = ''): User[] =>
  users.filter(user =>
    user.full_name
      .replace(/(\s|[a-z])/g, '')
      .toLowerCase()
      .startsWith(filter.toLowerCase()),
  );

export const getUniqueUsers = (users: User[]): User[] => uniqby(users, 'email');

export const sortByPositionOfKeyword = (users: User[], filter: string = ''): User[] => {
  if (filter === '') {
    return users;
  }
  const beginOfUserName = filterUserStartWith(users, filter);
  const beginOfInitialName = filterUserByInitials(users, filter);
  const beginOfEmail = filterUserEmailStartWith(users, filter);
  return getUniqueUsers([...beginOfUserName, ...beginOfEmail, ...beginOfInitialName, ...users]);
};

export const sortUserList = (
  users: User[],
  presences: PresenceState,
  filter: string = '',
): User[] =>
  [...sortByPositionOfKeyword(users, filter)].sort(
    (x1, x2) => statusOrder(presences[x1.email]) - statusOrder(presences[x2.email]),
  );

export const filterUserList = (users: User[], filter: string = '', ownEmail: ?string): User[] =>
  users.length > 0
    ? users.filter(
        user =>
          user.email !== ownEmail
          && (filter === ''
            || user.full_name.toLowerCase().includes(filter.toLowerCase())
            || user.email.toLowerCase().includes(filter.toLowerCase())),
      )
    : users;

export const getUsersAndWildcards = (users: User[]) => [
  { ...NULL_USER, full_name: 'all', email: '(Notify everyone)' },
  { ...NULL_USER, full_name: 'everyone', email: '(Notify everyone)' },
  ...users,
];

export const getAutocompleteSuggestion = (
  users: User[],
  filter: string = '',
  ownEmail: string,
): User[] => {
  if (users.length === 0) {
    return users;
  }
  const allAutocompleteOptions = getUsersAndWildcards(users);
  const filteredUserExcludeSelf = filterUserList(allAutocompleteOptions, filter, ownEmail);
  return sortByPositionOfKeyword(filteredUserExcludeSelf, filter);
};

export const getAutocompleteUserGroupSuggestions = (
  userGroups: UserGroup[],
  filter: string = '',
): UserGroup[] =>
  userGroups.filter(
    userGroup =>
      userGroup.name.toLowerCase().includes(filter.toLowerCase())
      || userGroup.description.toLowerCase().includes(filter.toLowerCase()),
  );
