/* @flow strict-local */
// $FlowFixMe[untyped-import]
import uniqby from 'lodash.uniqby';
import * as typeahead from '@zulip/shared/js/typeahead';

import type {
  MutedUsersState,
  UserPresence,
  UserId,
  UserGroup,
  PresenceState,
  UserOrBot,
} from '../types';
import { ensureUnreachable } from '../types';
import { statusFromPresence } from '../utils/presence';

type UsersByStatus = {|
  active: UserOrBot[],
  idle: UserOrBot[],
  offline: UserOrBot[],
  unavailable: UserOrBot[],
|};

export const groupUsersByStatus = (
  users: $ReadOnlyArray<UserOrBot>,
  presences: PresenceState,
): UsersByStatus => {
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

export const sortUserList = (
  users: $ReadOnlyArray<UserOrBot>,
  presences: PresenceState,
): $ReadOnlyArray<UserOrBot> =>
  [...users].sort(
    (x1, x2) =>
      statusOrder(presences[x1.email]) - statusOrder(presences[x2.email])
      || x1.full_name.toLowerCase().localeCompare(x2.full_name.toLowerCase()),
  );

export const filterUserList = (
  users: $ReadOnlyArray<UserOrBot>,
  filter: string,
): $ReadOnlyArray<UserOrBot> =>
  users.filter(
    user =>
      filter === ''
      || user.full_name.toLowerCase().includes(filter.toLowerCase())
      || user.email.toLowerCase().includes(filter.toLowerCase()),
  );

export const filterUserStartWith = (
  users: $ReadOnlyArray<UserOrBot>,
  filter: string,
  ownUserId: UserId,
): $ReadOnlyArray<UserOrBot> => {
  const loweredFilter = filter.toLowerCase();
  const isAscii = /^[a-z]+$/.test(loweredFilter);
  return users.filter(user => {
    const full_name = isAscii ? typeahead.remove_diacritics(user.full_name) : user.full_name;
    return user.user_id !== ownUserId && full_name.toLowerCase().startsWith(loweredFilter);
  });
};

export const filterUserThatContains = (
  users: $ReadOnlyArray<UserOrBot>,
  filter: string,
  ownUserId: UserId,
): $ReadOnlyArray<UserOrBot> => {
  const loweredFilter = filter.toLowerCase();
  const isAscii = /^[a-z]+$/.test(loweredFilter);
  return users.filter(user => {
    const full_name = isAscii ? typeahead.remove_diacritics(user.full_name) : user.full_name;
    return user.user_id !== ownUserId && full_name.toLowerCase().includes(filter.toLowerCase());
  });
};

export const filterUserMatchesEmail = (
  users: $ReadOnlyArray<UserOrBot>,
  filter: string,
  ownUserId: UserId,
): $ReadOnlyArray<UserOrBot> =>
  users.filter(
    user => user.user_id !== ownUserId && user.email.toLowerCase().includes(filter.toLowerCase()),
  );

export const getUniqueUsers = (users: $ReadOnlyArray<UserOrBot>): $ReadOnlyArray<UserOrBot> =>
  uniqby(users, 'email');

export const getAutocompleteSuggestion = (
  users: $ReadOnlyArray<UserOrBot>,
  filter: string,
  ownUserId: UserId,
  mutedUsers: MutedUsersState,
): $ReadOnlyArray<UserOrBot> => {
  if (users.length === 0) {
    return users;
  }
  const startWith = filterUserStartWith(users, filter, ownUserId);
  const contains = filterUserThatContains(users, filter, ownUserId);
  const matchesEmail = filterUserMatchesEmail(users, filter, ownUserId);
  const candidates = getUniqueUsers([...startWith, ...contains, ...matchesEmail]);
  return candidates.filter(user => !mutedUsers.has(user.user_id));
};

export const getAutocompleteUserGroupSuggestions = (
  userGroups: $ReadOnlyArray<UserGroup>,
  filter: string = '',
): $ReadOnlyArray<UserGroup> =>
  userGroups.filter(
    userGroup =>
      userGroup.name.toLowerCase().includes(filter.toLowerCase())
      || userGroup.description.toLowerCase().includes(filter.toLowerCase()),
  );
