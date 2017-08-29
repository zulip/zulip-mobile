/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { NULL_USER } from '../nullObjects';
import type { User } from '../types';
import { TextAvatar, RawLabel, Touchable, UnreadCount } from '../common';
import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  text: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  selectedText: {
    color: 'white',
  },
});

export default class ConversationGroup extends PureComponent {
  props: {
    isSelected: boolean,
    email: string,
    users: User[],
    unreadCount: number,
    onPress: (emails: string) => void,
  };

  handlePress = () => {
    const { email, onPress } = this.props;
    onPress(email);
  };

  render() {
    const { isSelected, email, users, unreadCount } = this.props;
    const allNames = email
      .split(',')
      .map(e => (users.find(x => x.email === e) || NULL_USER).fullName)
      .join(', ');

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, isSelected && styles.selectedRow]}>
          <TextAvatar size={32} name={allNames} />
          <RawLabel
            style={[styles.text, isSelected && styles.selectedText]}
            numberOfLines={2}
            ellipsizeMode="tail"
            text={allNames}
          />
          <UnreadCount count={unreadCount} />
        </View>
      </Touchable>
    );
  }
}
