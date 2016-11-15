import React, { Component } from 'react';
import {
  Text,
  View,
  ListView,
  StyleSheet,
} from 'react-native';

import { Popup, Touchable } from '../common';
import getFilteredEmojiList from '../emoji/getFilteredEmojiList';
import Emoji from '../emoji/Emoji';


const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: 'row',
    padding: 2,
  },
});

export default class EmojiAutocomplete extends Component {

  props: {
    filter: string;
  };

  handleSelect = (index: number) => {
  }

  render() {
    const { filter } = this.props;
    const emojis = getFilteredEmojiList(filter);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(emojis);

    return (
      <Popup>
        {emojis.map(x =>
          <Touchable onPress={this.handleSelect}>
            <View key={x} style={styles.emojiRow}>
              <Emoji name={x} size={15} />
              <Text>{x}</Text>
            </View>
          </Touchable>
        )}
      </Popup>
    );
  }
}
