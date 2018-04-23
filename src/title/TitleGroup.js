/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { User } from '../types';
import { Avatar } from '../common';

const componentStyles = StyleSheet.create({
  avatar: {
    paddingRight: 8,
  },
});

type Props = {
  recipients: User[],
};

export default class TitleGroup extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { recipients } = this.props;

    return (
      <View style={styles.navWrapper}>
        {recipients.map((user, index) => (
          <View key={user.email} style={componentStyles.avatar}>
            <Avatar size={32} name={user.fullName} avatarUrl={user.avatarUrl} email={user.email} />
          </View>
        ))}
      </View>
    );
  }
}
