/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Presence } from '../types';
import { Avatar, RawLabel, Touchable, UnreadCount } from '../common';
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
    marginLeft: 8,
  },
  selectedText: {
    color: 'white',
  },
  textEmail: {
    fontSize: 10,
    color: '#999',
  },
  textWrapper: {
    flex: 1,
  },
});

type Props = {
  email: string,
  fullName: string,
  avatarUrl: string,
  presence?: Presence,
  isSelected?: boolean,
  showEmail?: boolean,
  unreadCount?: number,
  onPress: (email: string) => void,
};

export default class UserItem extends PureComponent<Props> {
  props: Props;

  handlePress = () => {
    const { email, onPress } = this.props;
    if (email && onPress) {
      onPress(email);
    }
  };

  render() {
    const { fullName, avatarUrl, presence, isSelected, unreadCount, showEmail, email } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, isSelected && styles.selectedRow]}>
          <Avatar
            size={32}
            avatarUrl={avatarUrl}
            email={email}
            name={fullName}
            presence={presence}
            onPress={this.handlePress}
          />
          <View style={styles.textWrapper}>
            <RawLabel
              style={[styles.text, isSelected && styles.selectedText]}
              text={fullName}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
            {showEmail && (
              <RawLabel
                style={[styles.text, styles.textEmail, isSelected && styles.selectedText]}
                text={email}
                numberOfLines={1}
                ellipsizeMode="tail"
              />
            )}
          </View>
          <UnreadCount count={unreadCount} inverse={isSelected} />
        </View>
      </Touchable>
    );
  }
}
