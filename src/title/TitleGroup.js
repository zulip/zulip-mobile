/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { UserType, Narrow, Actions } from '../types';
import boundActions from '../boundActions';
import { NULL_USER } from '../nullObjects';
import { Avatar, Touchable } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  avatar: {
    paddingLeft: 4,
    paddingRight: 4,
  },
});

class TitleGroup extends PureComponent {
  props: {
    actions: Actions,
    users: UserType,
    narrow: Narrow,
  };

  handlePress = () => {
    const { narrow, actions, users } = this.props;
    actions.navigateToGroupDetails(this.getRecipients(narrow, users));
  };

  getRecipients = (narrow: Narrow, users: UserType) =>
    narrow[0].operand.split(',').map(r => users.find(x => x.email === r) || NULL_USER);

  render() {
    const { narrow, users } = this.props;
    const recipients = this.getRecipients(narrow, users);

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.wrapper}>
          {recipients.map(user =>
            <View key={user.email} style={styles.avatar}>
              <Avatar
                size={32}
                name={user.fullName}
                avatarUrl={user.avatarUrl}
                onPress={this.handlePress}
              />
            </View>,
          )}
        </View>
      </Touchable>
    );
  }
}

export default connect(null, boundActions)(TitleGroup);
