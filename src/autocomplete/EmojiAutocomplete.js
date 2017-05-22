/* @flow */
import React, { Component } from 'react';

import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import getFilteredEmojiList from '../emoji/getFilteredEmojiList';

export default class EmojiAutocomplete extends Component {

  props: {
    filter: string;
    onAutocomplete: (name: string) => {},
  };

  render() {
    const { filter, onAutocomplete } = this.props;
    const emojis = getFilteredEmojiList(filter).slice(0, 5);

    if (emojis.length === 0) return null;

    return (
      <Popup>
        {emojis.map(x => (
          <EmojiRow
            key={x}
            name={x}
            onPress={() => onAutocomplete(x)}
          />
        ))}
      </Popup>
    );
  }
}
