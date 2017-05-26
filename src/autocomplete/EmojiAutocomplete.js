/* @flow */
import React, { Component } from 'react';
import { ListView } from 'react-native';

import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import getFilteredEmojiList from '../emoji/getFilteredEmojiList';

export default class EmojiAutocomplete extends Component {

  props: {
    filter: string;
    onAutocomplete: (name: string) => void,
  };

  render() {
    const { filter, onAutocomplete } = this.props;
    const emojis = getFilteredEmojiList(filter);

    if (emojis.length === 0) return null;

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(emojis);

    return (
      <Popup>
        <ListView
          dataSource={dataSource}
          renderRow={x => (
            <EmojiRow
              key={x}
              name={x}
              onPress={() => onAutocomplete(x)}
            />
          )}
        />
      </Popup>
    );
  }
}
