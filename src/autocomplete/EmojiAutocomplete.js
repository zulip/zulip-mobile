/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import getFilteredEmojiList from '../emoji/getFilteredEmojiList';

type Props = {
  filter: string,
  onAutocomplete: (name: string) => void,
};

export default class EmojiAutocomplete extends PureComponent<Props> {
  props: Props;

  render() {
    const { filter, onAutocomplete } = this.props;
    const emojis = getFilteredEmojiList(filter);

    if (emojis.length === 0) return null;

    return (
      <Popup>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={12}
          data={emojis}
          keyExtractor={item => item}
          renderItem={({ item }) => <EmojiRow name={item} onPress={() => onAutocomplete(item)} />}
        />
      </Popup>
    );
  }
}
