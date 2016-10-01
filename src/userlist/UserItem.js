import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Avatar from '../common/Avatar';
import UserStatusIndicator from './UserStatusIndicator';

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
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
    fullName: string,
    avatarUrl: string,
    status: string,
    onPress: () => void,
  }

  render() {
    const { fullName, avatarUrl, status, onPress } = this.props;

    return (
      <TouchableHighlight onPress={onPress}>
        <View style={styles.container}>
          <Avatar size={32} avatarUrl={avatarUrl} />
          <Text style={styles.text}>{fullName}</Text>
          <UserStatusIndicator status={status} />
        </View>
      </TouchableHighlight>
    );
  }
}
