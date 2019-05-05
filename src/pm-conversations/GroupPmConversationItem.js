/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { UserOrBot } from '../types';
import { GroupAvatar, RawLabel, Touchable, UnreadCount } from '../common';
import styles from '../styles';

const componentStyles = StyleSheet.create({
  text: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
});

type Props = {|
  email: string,
  usersByEmail: Map<string, UserOrBot>,
  unreadCount: number,
  onPress: (emails: string) => void,
|};

/**
 * A list item describing one group PM conversation.
 * */
export default class GroupPmConversationItem extends PureComponent<Props> {
  handlePress = () => {
    const { email, onPress } = this.props;
    onPress(email);
  };

  render() {
    const { email, usersByEmail, unreadCount } = this.props;
    const allUsers = email.split(',').map(e => usersByEmail.get(e));

    const allUsersFound = allUsers.every(user => user);

    if (!allUsersFound) {
      return null;
    }

    // $FlowFixMe Flow doesn't see the `every` check above.
    const allNames = allUsers.map(user => user.full_name).join(', ');

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.listItem}>
          <GroupAvatar size={32} names={allNames} />
          <RawLabel
            style={componentStyles.text}
            numberOfLines={2}
            ellipsizeMode="tail"
            text={allNames}
          />
          <UnreadCount count={unreadCount} />
        </View>
      </Touchable>
    );
  }
}
