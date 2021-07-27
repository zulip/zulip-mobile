/* @flow strict-local */
import React, { type ElementConfig, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { TranslationContext } from '../boot/TranslationProvider';
import type { UserId } from '../types';
import { RawLabel, Touchable, UnreadCount } from '../common';
import { UserAvatarWithPresenceById } from '../common/UserAvatarWithPresence';
import styles, { createStyleSheet, BRAND_COLOR } from '../styles';
import { useSelector } from '../react-redux';
import { getUserForId } from './userSelectors';
import { getMutedUsers } from '../selectors';

const componentStyles = createStyleSheet({
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  text: {
    marginLeft: 16,
  },
  selectedText: {
    color: 'white',
  },
  textEmail: {
    fontSize: 10,
    color: 'hsl(0, 0%, 60%)',
  },
  textWrapper: {
    flex: 1,
  },
});

type Props<UserT> = $ReadOnly<{|
  user: UserT,
  isSelected?: boolean,
  showEmail?: boolean,
  unreadCount?: number,
  onPress?: UserT => void,
|}>;

/**
 * A user represented with avatar and name, for use in a list.
 *
 * Prefer the default export `UserItem` over this component: it does the
 * same thing but provides a more encapsulated interface.
 *
 * This component is potentially appropriate if displaying a synthetic fake
 * user, one that doesn't exist in the database.  (But anywhere we're doing
 * that, there's probably a better UI anyway than showing a fake user.)
 */
export function UserItemRaw<UserT: { user_id: UserId, email: string, full_name: string, ... }>(
  props: Props<UserT>,
): Node {
  const { user, isSelected = false, onPress, unreadCount, showEmail = false } = props;
  const _ = useContext(TranslationContext);
  const isMuted = useSelector(getMutedUsers).has(user.user_id);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(user);
    }
  }, [onPress, user]);

  return (
    <Touchable onPress={onPress && handlePress}>
      <View style={[styles.listItem, isSelected && componentStyles.selectedRow]}>
        <UserAvatarWithPresenceById
          size={48}
          userId={user.user_id}
          isMuted={isMuted}
          onPress={onPress && handlePress}
        />
        <View style={componentStyles.textWrapper}>
          <RawLabel
            style={[componentStyles.text, isSelected && componentStyles.selectedText]}
            text={isMuted ? _('Muted user') : user.full_name}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
          {showEmail && !isMuted && (
            <RawLabel
              style={[
                componentStyles.text,
                componentStyles.textEmail,
                isSelected && componentStyles.selectedText,
              ]}
              text={user.email}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
          )}
        </View>
        <UnreadCount count={unreadCount} inverse={isSelected} />
      </View>
    </Touchable>
  );
}

type OuterProps = $ReadOnly<{|
  ...$Exact<$Diff<ElementConfig<typeof UserItemRaw>, {| user: mixed |}>>,
  userId: UserId,
|}>;

/**
 * A user represented with avatar and name, for use in a list.
 *
 * Use this in preference to `UserItemRaw`.  That helps us better
 * encapsulate getting user data where it's needed.
 */
// eslint-disable-next-line func-names
export default function (props: OuterProps): Node {
  const { userId, ...restProps } = props;
  const user = useSelector(state => getUserForId(state, userId));
  return <UserItemRaw {...restProps} user={user} />;
}
