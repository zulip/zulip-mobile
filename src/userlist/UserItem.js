import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
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
  }
});

export default class UserItem extends Component {

  props: {
    name: string,
    status: sring,
    onPress: (e: SyntheticEvent) => void,
  }

  render() {
    const { name, status, onPress } = this.props;

    return (
      <TouchableHighlight style={styles.touchTarget} onPress={onPress}>
        <View style={styles.container}>
          <UserStatusIndicator status={status} />
          <Text style={styles.text}>{name}</Text>
        </View>
      </TouchableHighlight>
    )
  }
}
