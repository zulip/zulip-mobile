/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSelector } from '../react-redux';
import type { UserOrBot } from '../types';
import styles, { createStyleSheet } from '../styles';
import { GroupAvatar, RawLabel, Touchable, UnreadCount } from '../common';
import { getMutedUsers } from '../selectors';
import { TranslationContext } from '../boot/TranslationProvider';

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
 *
 * Pads the horizontal insets with its background.
 */
export default function GroupPmConversationItem<U: $ReadOnlyArray<UserOrBot>>(
  props: Props<U>,
): Node {
  const { users, unreadCount, onPress } = props;

  const handlePress = useCallback(() => {
    onPress(users);
  }, [onPress, users]);

  const _ = useContext(TranslationContext);
  const mutedUsers = useSelector(getMutedUsers);
  const names = users.map(user =>
    mutedUsers.has(user.user_id) ? _('Muted user') : user.full_name,
  );

  return (
    <Touchable onPress={handlePress}>
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.listItem}>
        <GroupAvatar size={48} names={names} />
        <RawLabel
          style={componentStyles.text}
          numberOfLines={2}
          ellipsizeMode="tail"
          text={names.join(', ')}
        />
        <UnreadCount count={unreadCount} />
      </SafeAreaView>
    </Touchable>
  );
}
