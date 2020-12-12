/* @flow strict-local */
import uniqby from 'lodash.uniqby';

import type { UserPresence, User, UserId, UserGroup, PresenceState } from '../types';
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

export const sortUserList = (users: User[], presences: PresenceState): User[] =>
  [...users].sort(
    (x1, x2) =>
      statusOrder(presences[x1.email]) - statusOrder(presences[x2.email])
      || x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase()),
  );

export const filterUserList = (users: User[], filter: string = '', ownUserId: ?UserId): User[] =>
  users.length > 0
    ? users.filter(
        user =>
          user.user_id !== ownUserId
          && (filter === ''
            || user.full_name.toLowerCase().includes(filter.toLowerCase())
            || user.email.toLowerCase().includes(filter.toLowerCase())),
      )
    : users;

export const sortAlphabetically = (users: User[]): User[] =>
  [...users].sort((x1, x2) => x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase()));

export const filterUserStartWith = (
  users: User[],
  filter: string = '',
  ownUserId: UserId,
): User[] =>
  users.filter(
    user =>
      user.user_id !== ownUserId && user.full_name.toLowerCase().startsWith(filter.toLowerCase()),
  );

export const filterUserByInitials = (
  users: User[],
  filter: string = '',
  ownUserId: UserId,
): User[] =>
  users.filter(
    user =>
      user.user_id !== ownUserId
      && user.full_name
        .replace(/(\s|[a-z])/g, '')
        .toLowerCase()
        .startsWith(filter.toLowerCase()),
  );

export const filterUserThatContains = (
  users: User[],
  filter: string = '',
  ownUserId: UserId,
): User[] =>
  users.filter(
    user =>
      user.user_id !== ownUserId && user.full_name.toLowerCase().includes(filter.toLowerCase()),
  );

export const filterUserMatchesEmail = (
  users: User[],
  filter: string = '',
  ownUserId: UserId,
): User[] =>
  users.filter(
    user => user.user_id !== ownUserId && user.email.toLowerCase().includes(filter.toLowerCase()),
  );

export const getUniqueUsers = (users: User[]): User[] => uniqby(users, 'email');

export const getUsersAndWildcards = (users: User[]) => [
  { ...NULL_USER, full_name: 'all', email: '(Notify everyone)' },
  { ...NULL_USER, full_name: 'everyone', email: '(Notify everyone)' },
  ...users,
];

export const getAutocompleteSuggestion = (
  users: User[],
  filter: string = '',
  ownUserId: UserId,
): User[] => {
  if (users.length === 0) {
    return users;
  }
  const allAutocompleteOptions = getUsersAndWildcards(users);
  const startWith = filterUserStartWith(allAutocompleteOptions, filter, ownUserId);
  const initials = filterUserByInitials(allAutocompleteOptions, filter, ownUserId);
  const contains = filterUserThatContains(allAutocompleteOptions, filter, ownUserId);
  const matchesEmail = filterUserMatchesEmail(users, filter, ownUserId);
  return getUniqueUsers([...startWith, ...initials, ...contains, ...matchesEmail]);
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
