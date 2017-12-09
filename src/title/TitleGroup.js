/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Actions, User } from '../types';
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

type Props = {
  actions: Actions,
  recipients: User[],
};

export default class TitleGroup extends PureComponent<Props> {
  props: Props;

  render() {
    const { recipients } = this.props;

    return (
      <View style={styles.wrapper}>
        {recipients.map(user => (
          <View key={user.email} style={styles.avatar}>
            <Avatar size={32} name={user.fullName} avatarUrl={user.avatarUrl} email={user.email} />
          </View>
        ))}
      </View>
    );
  }
}
