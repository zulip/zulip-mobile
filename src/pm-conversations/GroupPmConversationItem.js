/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { UserOrBot } from '../types';
import { GroupAvatar, RawLabel, Touchable, UnreadCount } from '../common';
import styles from '../styles';

const componentStyles = StyleSheet.create({
  text: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
});

type Props = $ReadOnly<{|
  users: UserOrBot[],
  unreadCount: number,
  onPress: (users: UserOrBot[]) => void,
|}>;

/**
 * A list item describing one group PM conversation.
 * */
export default class GroupPmConversationItem extends PureComponent<Props> {
  handlePress = () => {
    const { users, onPress } = this.props;
    onPress(users);
  };

  render() {
    const { users, unreadCount } = this.props;

    const allNames = users.map(user => user.full_name);

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.listItem}>
          <GroupAvatar size={48} names={allNames} />
          <RawLabel
            style={componentStyles.text}
            numberOfLines={2}
            ellipsizeMode="tail"
            text={allNames.join(', ')}
          />
          <UnreadCount count={unreadCount} />
        </View>
      </Touchable>
    );
  }
}
