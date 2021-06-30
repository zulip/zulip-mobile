/* @flow strict-local */

import React, { useCallback } from 'react';
import { SectionList } from 'react-native';

import type { UserGroup } from '../types';
import { useSelector } from '../react-redux';
import { getMutedUsers, getSortedUsers, getUserGroups } from '../selectors';
import {
  type AutocompleteOption,
  getAutocompleteSuggestion,
  getAutocompleteUserGroupSuggestions,
} from '../users/userHelpers';
import { Popup } from '../common';
import { UserItemRaw } from '../users/UserItem';
import UserGroupItem from '../user-groups/UserGroupItem';
import { getOwnUserId } from '../users/userSelectors';

type Props = $ReadOnly<{|
  filter: string,
  onAutocomplete: (name: string) => void,
|}>;

export default function PeopleAutocomplete(props: Props) {
  const { filter, onAutocomplete } = props;
  const mutedUsers = useSelector(getMutedUsers);
  const ownUserId = useSelector(getOwnUserId);
  const users = useSelector(getSortedUsers);
  const userGroups = useSelector(getUserGroups);

  const handleUserGroupItemAutocomplete = useCallback(
    (name: string): void => {
      onAutocomplete(`*${name}*`);
    },
    [onAutocomplete],
  );

  const handleUserItemAutocomplete = useCallback(
    (user: AutocompleteOption): void => {
      // If another user with the same full name is found, we send the
      // user ID as well, to ensure the mentioned user is uniquely identified.
      if (users.find(x => x.full_name === user.full_name && x.user_id !== user.user_id)) {
        // See the `get_mention_syntax` function in
        // `static/js/people.js` in the webapp.
        onAutocomplete(`**${user.full_name}|${user.user_id}**`);
        return;
      }
      onAutocomplete(`**${user.full_name}**`);
    },
    [users, onAutocomplete],
  );

  const filteredUserGroups = getAutocompleteUserGroupSuggestions(userGroups, filter);
  const filteredUsers = getAutocompleteSuggestion(users, filter, ownUserId, mutedUsers);

  if (filteredUserGroups.length + filteredUsers.length === 0) {
    return null;
  }

  type Section<T> = {|
    +data: $ReadOnlyArray<T>,
    +renderItem: ({ item: T, ... }) => React$MixedElement,
  |};
  const sections = [
    ({
      data: filteredUserGroups,
      renderItem: ({ item }) => (
        <UserGroupItem
          key={item.name}
          name={item.name}
          description={item.description}
          onPress={handleUserGroupItemAutocomplete}
        />
      ),
    }: Section<UserGroup>),
    ({
      data: filteredUsers,
      renderItem: ({ item }) => (
        // "Raw" because some of our autocomplete suggestions are fake
        // synthetic "users" to represent @all and @everyone.
        // TODO display those in a UI that makes more sense for them,
        //   and drop the fake "users" and use the normal UserItem.
        <UserItemRaw
          key={item.user_id}
          user={item}
          showEmail
          onPress={handleUserItemAutocomplete}
        />
      ),
    }: Section<AutocompleteOption>),
  ];

  return (
    <Popup>
      {/* eslint-disable-next-line react/jsx-curly-brace-presence */}
      {
        // $FlowFixMe[incompatible-variance]
        /* $FlowFixMe[prop-missing]
             SectionList type is confused; should take $ReadOnly
             objects. */
        <SectionList
          keyboardShouldPersistTaps="always"
          initialNumToRender={10}
          sections={sections}
        />
      }
    </Popup>
  );
}
