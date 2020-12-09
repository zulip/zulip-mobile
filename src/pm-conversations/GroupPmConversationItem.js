/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { UserOrBot } from '../types';
import styles, { createStyleSheet } from '../styles';
import { GroupAvatar, RawLabel, Touchable, UnreadCount } from '../common';

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
export default class GroupPmConversationItem<U: $ReadOnlyArray<UserOrBot>> extends PureComponent<
  Props<U>,
> {
  handlePress = () => {
    const { users, onPress } = this.props;
    onPress(users);
  };

  render() {
    const { users, unreadCount } = this.props;
    const names = users.map(user => user.full_name);

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.listItem}>
          <GroupAvatar size={48} names={names} />
          <RawLabel
            style={componentStyles.text}
            numberOfLines={2}
            ellipsizeMode="tail"
            text={names.join(', ')}
          />
          <UnreadCount count={unreadCount} />
        </View>
      </Touchable>
    );
  }
}
