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
      <TouchableHighlight underlayColor="rgba(34, 105, 63, 0.5)" onPress={this.handlePress}>
        <View style={styles.container}>
          <Avatar size={32} avatarUrl={avatarUrl} />
          <Text style={styles.text}>{fullName}</Text>
          <UserStatusIndicator status={status} />
        </View>
      </TouchableHighlight>
    );
  }
}
