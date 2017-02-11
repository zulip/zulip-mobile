import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import { Avatar, Touchable } from '../common';
import { getFullUrl } from '../utils/url';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    paddingLeft: 4,
    paddingRight: 4,
  },
  menuButton: {
    fontSize: 30,
    color: 'white',
  },
  menuTouchable: {
    height: 44,
    width: 44,
  }
});

export default class TitleGroup extends React.PureComponent {

  handlePress(recipients) {
    this.props.openOverFlowMenu(recipients);
  }

  render() {
    const { realm, narrow, users, color } = this.props;
    const recipientEmails = narrow[0].operand.split(',');
    const recipients = recipientEmails.map(r => users.find(x => x.email === r));

    return (
      <View style={styles.wrapper}>
        {recipients.map(user =>
          <View key={user.email} style={styles.avatar}>
            <Avatar
              size={32}
              name={user.fullName}
              avatarUrl={getFullUrl(user.avatarUrl, realm)}
            />
          </View>
        )}
        <Touchable
          style={styles.menuTouchable}
          onPress={() => this.handlePress(recipients)}
        >
          <View >
            <Text style={[styles.menuButton, styles.avatar, { color }]}>&#8942;</Text>
          </View>
        </Touchable>
      </View>
    );
  }
}
