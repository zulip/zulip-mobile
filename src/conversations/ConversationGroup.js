/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { NULL_USER } from '../nullObjects';
import { TextAvatar, RawLabel, Touchable, UnreadCount } from '../common';

const styles = StyleSheet.create({
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  text: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
});

type Props = {
  email: string,
  usersByEmail: Object,
  unreadCount: number,
  onPress: (emails: string) => void,
};

export default class ConversationGroup extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { email, onPress } = this.props;
    onPress(email);
  };

  render() {
    const { email, usersByEmail, unreadCount } = this.props;
    const allNames = email
      .split(',')
      .map(e => (usersByEmail[e] || NULL_USER).fullName)
      .join(', ');

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.row}>
          <TextAvatar size={32} name={allNames} />
          <RawLabel style={styles.text} numberOfLines={2} ellipsizeMode="tail" text={allNames} />
          <UnreadCount count={unreadCount} />
        </View>
      </Touchable>
    );
  }
}
