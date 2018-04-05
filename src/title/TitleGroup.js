/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { User } from '../types';
import { Avatar } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  avatar: {
    paddingRight: 8,
  },
});

type Props = {
  recipients: User[],
};

export default class TitleGroup extends PureComponent<Props> {
  props: Props;

  render() {
    const { recipients } = this.props;

    return (
      <View style={styles.wrapper}>
        {recipients.map((user, index) => (
          <View key={user.email} style={styles.avatar}>
            <Avatar size={24} name={user.fullName} avatarUrl={user.avatarUrl} email={user.email} />
          </View>
        ))}
      </View>
    );
  }
}
