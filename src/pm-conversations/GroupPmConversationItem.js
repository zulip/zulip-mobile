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

type Props = $ReadOnly<{|
  email: string,
  usersByEmail: Map<string, UserOrBot>,
  unreadCount: number,
  onPress: (emails: string) => void,
|}>;

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
    const allNames = allUsers.map(user => user.full_name);

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
