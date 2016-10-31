import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Avatar, Touchable } from '../common';
import UserStatusIndicator from './UserStatusIndicator';

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  touchTarget: {
  },
  text: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default class UserItem extends Component {

  props: {
    email: string,
    fullName: string,
    avatarUrl: string,
    status: string,
    onPress: () => void,
  }

  handlePress = () =>
    this.props.onPress(this.props.email);

  render() {
    const { fullName, avatarUrl, status } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.container}>
          <Avatar size={32} avatarUrl={avatarUrl} name={fullName} />
          <Text style={styles.text}>{fullName}</Text>
          <UserStatusIndicator status={status} />
        </View>
      </Touchable>
    );
  }
}
