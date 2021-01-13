/* @flow strict-local */
import React, { type ComponentType, type ElementConfig, PureComponent } from 'react';
import { View } from 'react-native';

import type { UserOrBot } from '../types';
import { RawLabel, Touchable, UnreadCount } from '../common';
import { UserAvatarWithPresenceById } from '../common/UserAvatarWithPresence';
import styles, { createStyleSheet, BRAND_COLOR } from '../styles';
import { useSelector } from '../react-redux';
import { getUserForId } from './userSelectors';

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

type Props = $ReadOnly<{|
  user: UserOrBot,
  isSelected: boolean,
  showEmail: boolean,
  unreadCount?: number,
  onPress: UserOrBot => void,
|}>;

// See UserAvatarWithPresence for discussion of this inexact object type.
class UserItem extends PureComponent<$ReadOnly<{ ...Props, ... }>> {
  static defaultProps = {
    isSelected: false,
    showEmail: false,
  };

  handlePress = () => {
    const { user, onPress } = this.props;
    // TODO cut this `user.email` condition -- it should never trigger, and
    //   looks like a fudge for the possibility of data coming from NULL_USER
    if (user.email && onPress) {
      onPress(user);
    }
  };

  render() {
    const { user, isSelected, unreadCount, showEmail } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.listItem, isSelected && componentStyles.selectedRow]}>
          <UserAvatarWithPresenceById size={48} userId={user.user_id} onPress={this.handlePress} />
          <View style={componentStyles.textWrapper}>
            <RawLabel
              style={[componentStyles.text, isSelected && componentStyles.selectedText]}
              text={user.full_name}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
            {showEmail && (
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
}

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
// Export the class with a tighter constraint on acceptable props, namely
// that the type is an exact object type as usual.
export const UserItemRaw = (UserItem: ComponentType<$Exact<ElementConfig<typeof UserItem>>>);

type OuterProps = $ReadOnly<{|
  ...$Exact<$Diff<ElementConfig<typeof UserItem>, { user: mixed }>>,
  userId: number,
|}>;

/**
 * A user represented with avatar and name, for use in a list.
 *
 * Use this in preference to `UserItemRaw`.  That helps us better
 * encapsulate getting user data where it's needed.
 */
// eslint-disable-next-line func-names
export default function (props: OuterProps) {
  const user = useSelector(state => getUserForId(state, props.userId));
  return <UserItem {...props} user={user} />;
}
