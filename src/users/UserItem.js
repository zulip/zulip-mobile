import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, RawLabel, Touchable, UnreadCount, ZulipButton } from '../common';
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
  sendButton: {
    height: 26,
    width: 50,
  }
});

export default class UserItem extends Component {

  props: {
    email: string,
    fullName: string,
    avatarUrl: string,
    status: string,
    isSelected: boolean,
    unreadCount: number,
    onPress: () => void,
  }

  handlePress = () =>
    this.props.onPress(this.props.email);

  render() {
    const { fullName, avatarUrl, status, isSelected, unreadCount, realm, shareScreen } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, !shareScreen && isSelected && styles.selectedRow]}>
          <Avatar
            size={32}
            avatarUrl={avatarUrl}
            name={fullName}
            status={status}
            realm={realm}
          />
          <RawLabel
            style={[styles.text, !shareScreen && isSelected && styles.selectedText]}
            text={fullName}
          />
          {shareScreen ?
            <ZulipButton
              style={styles.sendButton}
              text="Send"
              onPress={this.handlePress}
            /> :
            <UnreadCount count={unreadCount} />}
        </View>
      </Touchable>
    );
  }
}
