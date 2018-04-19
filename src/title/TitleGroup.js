/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { PresenceState, User } from '../types';
import { Avatar } from '../common';

const componentStyles = StyleSheet.create({
  avatar: {
    paddingRight: 8,
  },
});

type Props = {
  recipients: User[],
  presence: PresenceState,
};

export default class TitleGroup extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { recipients, presence } = this.props;

    return (
      <View style={styles.navWrapper}>
        {recipients.map((user, index) => (
          <View key={user.email} style={componentStyles.avatar}>
            <Avatar
              size={32}
              name={user.fullName}
              avatarUrl={user.avatarUrl}
              email={user.email}
              presence={presence[user.email]}
            />
          </View>
        ))}
      </View>
    );
  }
}
