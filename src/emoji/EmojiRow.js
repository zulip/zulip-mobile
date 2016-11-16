import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Touchable } from '../common';
import Emoji from '../emoji/Emoji';

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: 'row',
    padding: 2,
    alignItems: 'center',
  },
});

export default class EmojiRow extends React.Component {

  props: {
    name: string,
    onPress: () => {},
  }

  render() {
    const { name, onPress } = this.props;
    return (
      <Touchable onPress={onPress}>
        <View style={styles.emojiRow}>
          <Emoji name={name} size={15} />
          <Text>{name}</Text>
        </View>
      </Touchable>
    );
  }
}
