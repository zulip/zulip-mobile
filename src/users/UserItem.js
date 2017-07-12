/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

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
    marginRight: 8,
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

export default class UserItem extends PureComponent {
  props: {
    email?: string,
    fullName: string,
    avatarUrl: string,
    status?: string,
    isSelected?: boolean,
    showEmail?: boolean,
    unreadCount?: number,
    onPress: (email: string) => void,
    realm?: string,
  };

  handlePress = () => {
    const { email, onPress } = this.props;
    if (email && onPress) {
      onPress(email);
    }
  };

  render() {
    const {
      fullName,
      avatarUrl,
      status,
      isSelected,
      unreadCount,
      realm,
      showEmail,
      email,
    } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, isSelected && styles.selectedRow]}>
          <Avatar size={32} avatarUrl={avatarUrl} name={fullName} status={status} realm={realm} />
          <View style={styles.textWrapper}>
            <RawLabel style={[styles.text, isSelected && styles.selectedText]} text={fullName} />
            {showEmail &&
              <RawLabel
                style={[styles.text, styles.textEmail, isSelected && styles.selectedText]}
                text={email}
              />}
          </View>
          <UnreadCount count={unreadCount} />
        </View>
      </Touchable>
    );
  }
}
