/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Actions, User } from '../types';
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

export default class TitleGroup extends PureComponent {
  props: {
    actions: Actions,
    recipients: User[],
  };

  handlePress = () => {
    const { actions, recipients } = this.props;
    actions.navigateToGroupDetails(recipients);
  };

  render() {
    const { recipients } = this.props;

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
