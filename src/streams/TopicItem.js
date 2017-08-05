/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../styles';
import { RawLabel, Touchable, UnreadCount } from '../common';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(127, 127, 127, 0.25)',
  },
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  text: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  label: {
    flex: 1,
  },
  selectedText: {
    color: 'white',
  },
  muted: {
    opacity: 0.25,
  },
});

export default class StreamItem extends PureComponent {
  props: {
    stream: string,
    name: string,
    isMuted: boolean,
    isSelected: boolean,
    unreadCount: number,
    onPress: (topic: string, stream: string) => void,
  };

  static defaultProps = {
    isMuted: false,
    isSelected: false,
    unreadCount: 0,
  };

  handlePress = () => {
    const { name, stream, onPress } = this.props;
    onPress(stream, name);
  };

  render() {
    const { name, isMuted, isSelected, unreadCount } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, isSelected && styles.selectedRow, isMuted && styles.muted]}>
          <RawLabel
            style={[styles.label, isSelected && styles.selectedText]}
            text={name}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
          {unreadCount && <UnreadCount count={unreadCount} inverse={isSelected} />}
        </View>
      </Touchable>
    );
  }
}
