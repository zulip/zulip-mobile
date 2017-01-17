import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Avatar, Touchable } from '../common';

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

export default class UserGroup extends Component {

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
    const { allNames } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.container}>
          <Avatar size={32} name={allNames} />
          <Text style={styles.text}>{allNames}</Text>
        </View>
      </Touchable>
    );
  }
}
