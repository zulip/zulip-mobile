/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../styles';
import { RawLabel, Touchable, UnreadCount } from '../common';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 50,
    padding: 8,
  },
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  text: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
  },
  selectedText: {
    color: 'white',
  },
  mutedText: {
    color: 'gray',
  },
});

export default class StreamItem extends PureComponent {
  props: {
    name: string,
    isMuted?: boolean,
    isSelected?: boolean,
    unreadCount?: number,
    onPress: (name: string) => void,
  };

  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };

  render() {
    const { name, isMuted, isSelected, unreadCount } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={[styles.row, isSelected && styles.selectedRow]}>
          <View style={styles.text}>
            <RawLabel
              style={[isSelected && styles.selectedText, isMuted && styles.mutedText]}
              text={name}
            />
          </View>
          {unreadCount && <UnreadCount count={unreadCount} inverse={isSelected} />}
        </View>
      </Touchable>
    );
  }
}
