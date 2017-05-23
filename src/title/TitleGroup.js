import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { Avatar } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  avatar: {
    paddingLeft: 4,
    paddingRight: 4,
  },
});

export default class TitleGroup extends React.PureComponent {
  render() {
    const { realm, narrow, users } = this.props;
    const recipientEmails = narrow[0].operand.split(',');
    const recipients = recipientEmails.map(r => users.find(x => x.email === r) || {});

    return (
      <View style={styles.wrapper}>
        {recipients.map(user => (
          <View key={user.email} style={styles.avatar}>
            <Avatar
              size={32}
              name={user.fullName}
              avatarUrl={user.avatarUrl}
              realm={realm}
            />
          </View>
        ))}
      </View>
    );
  }
}
