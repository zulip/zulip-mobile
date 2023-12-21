/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { useSelector } from '../react-redux';
import type { UserOrBot } from '../types';
import styles, { createStyleSheet } from '../styles';
import GroupAvatar from '../common/GroupAvatar';
import ZulipText from '../common/ZulipText';
import Touchable from '../common/Touchable';
import UnreadCount from '../common/UnreadCount';
import { getMutedUsers } from '../selectors';
import { TranslationContext } from '../boot/TranslationProvider';
import {
  getFullNameOrMutedUserReactText,
  getFullNameOrMutedUserText,
} from '../users/userSelectors';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { getRealm } from '../directSelectors';

const componentStyles = createStyleSheet({
  text: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
});

type Props<U> = $ReadOnly<{|
  users: U,
  unreadCount: number,
  onPress: (users: U) => void,
|}>;

/**
 * A list item describing one group PM conversation.
 * */
export default function GroupPmConversationItem<U: $ReadOnlyArray<UserOrBot>>(
  props: Props<U>,
): Node {
  const { users, unreadCount, onPress } = props;

  const handlePress = useCallback(() => {
    onPress(users);
  }, [onPress, users]);

  const _ = useContext(TranslationContext);
  const mutedUsers = useSelector(getMutedUsers);
  const enableGuestUserIndicator = useSelector(state => getRealm(state).enableGuestUserIndicator);
  const names = users.map(user =>
    _(getFullNameOrMutedUserText({ user, mutedUsers, enableGuestUserIndicator })),
  );

  const namesReact = [];
  users.forEach((user, i) => {
    if (i !== 0) {
      namesReact.push(
        <ZulipText key={`${user.user_id}-comma`} inheritColor inheritFontSize text=", " />,
      );
    }
    namesReact.push(
      <ZulipTextIntl
        key={`${user.user_id}`}
        inheritColor
        inheritFontSize
        text={getFullNameOrMutedUserReactText({ user, mutedUsers, enableGuestUserIndicator })}
      />,
    );
  });

  return (
    <Touchable onPress={handlePress}>
      <View style={styles.listItem}>
        <GroupAvatar size={48} names={names} />
        <ZulipText style={componentStyles.text} numberOfLines={2} ellipsizeMode="tail">
          {namesReact}
        </ZulipText>
        <UnreadCount count={unreadCount} />
      </View>
    </Touchable>
  );
}
