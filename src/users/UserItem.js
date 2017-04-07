import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Avatar, Touchable} from '../common';
import {BRAND_COLOR} from '../common/styles';

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
  touchTarget: {},
  text: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  selectedText: {
    color: 'white',
  },
});

export default class UserItem extends Component {
  props: {
    email: string,
    fullName: string,
    avatarUrl: string,
    status: string,
    isSelected: boolean,
    onPress: () => void,
  };

  handlePress = () => this.props.onPress(this.props.email);

  render() {
    const {fullName, avatarUrl, status, isSelected} = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, isSelected && styles.selectedRow]}>
          <Avatar
            size={32}
            avatarUrl={avatarUrl}
            name={fullName}
            status={status}
          />
          <Text style={[styles.text, isSelected && styles.selectedText]}>
            {fullName}
          </Text>
        </View>
      </Touchable>
    );
  }
}
