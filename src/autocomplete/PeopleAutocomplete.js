/* @flow strict-local */

import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { SectionList } from 'react-native';

import type { UserOrBot, UserGroup, Narrow } from '../types';
import { useSelector } from '../react-redux';
import { getMutedUsers, getSortedUsers, getUserGroups } from '../selectors';
import {
  getAutocompleteSuggestion,
  getAutocompleteUserGroupSuggestions,
} from '../users/userHelpers';
import Popup from '../common/Popup';
import UserItem from '../users/UserItem';
import UserGroupItem from '../user-groups/UserGroupItem';
import { getOwnUserId } from '../users/userSelectors';
import WildcardMentionItem, {
  getWildcardMentionsForQuery,
  WildcardMentionType,
} from './WildcardMentionItem';
import { TranslationContext } from '../boot/TranslationProvider';
import { getZulipFeatureLevel } from '../account/accountsSelectors';

type Props = $ReadOnly<{|
  filter: string,
  destinationNarrow: Narrow,
  onAutocomplete: (name: string) => void,
|}>;

export default function PeopleAutocomplete(props: Props): Node {
  const { filter, destinationNarrow, onAutocomplete } = props;

  const _ = useContext(TranslationContext);

  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
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

  const handleWildcardMentionAutocomplete = useCallback(
    (type, serverCanonicalString) => {
      onAutocomplete(`**${serverCanonicalString}**`);
    },
    [onAutocomplete],
  );

  const handleUserItemAutocomplete = useCallback(
    (user: UserOrBot): void => {
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
  const wildcardMentionsForQuery = getWildcardMentionsForQuery(
    filter,
    destinationNarrow,
    // TODO(server-8.0)
    zulipFeatureLevel >= 224,
    _,
  );
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
      data: wildcardMentionsForQuery,
      renderItem: ({ item }) => (
        <WildcardMentionItem
          key={WildcardMentionType.getName(item)}
          type={item}
          destinationNarrow={destinationNarrow}
          onPress={handleWildcardMentionAutocomplete}
        />
      ),
    }: Section<WildcardMentionType>),
    ({
      data: filteredUsers,
      renderItem: ({ item }) => (
        <UserItem
          key={item.user_id}
          userId={item.user_id}
          showEmail
          onPress={handleUserItemAutocomplete}
          size="medium"
        />
      ),
    }: Section<UserOrBot>),
  ];

  return (
    <Popup>
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
