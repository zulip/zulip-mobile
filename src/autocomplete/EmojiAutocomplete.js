/* @flow strict-local */

import React from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import { getFilteredEmojis } from '../emoji/data';
import { useSelector } from '../react-redux';
import { getActiveImageEmojiByName } from '../selectors';

type Props = $ReadOnly<{|
  filter: string,
  onAutocomplete: (name: string) => void,
|}>;

const MAX_CHOICES = 30;

export default function EmojiAutocomplete(props: Props): Node {
  const { filter, onAutocomplete } = props;
  const activeImageEmojiByName = useSelector(getActiveImageEmojiByName);
  const emojiNames = getFilteredEmojis(filter, activeImageEmojiByName);

  if (emojiNames.length === 0) {
    return null;
  }

  return (
    <Popup>
      <FlatList
        keyboardShouldPersistTaps="always"
        initialNumToRender={12}
        data={emojiNames.slice(0, MAX_CHOICES)}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <EmojiRow
            type={item.emoji_type}
            code={item.code}
            name={item.name}
            onPress={onAutocomplete}
          />
        )}
      />
    </Popup>
  );
}
