/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import Popup from '../common/Popup';
import EmojiRow from '../emoji/EmojiRow';
import { getFilteredEmojis } from '../emoji/data';
import { useSelector } from '../react-redux';
import { getActiveImageEmoji } from '../selectors';
import { getRealm } from '../directSelectors';

type Props = $ReadOnly<{|
  filter: string,
  onAutocomplete: (name: string) => void,
|}>;

const MAX_CHOICES = 30;

export default function EmojiAutocomplete(props: Props): Node {
  const { filter, onAutocomplete } = props;
  const activeImageEmoji = useSelector(getActiveImageEmoji);
  const serverEmojiData = useSelector(state => getRealm(state).serverEmojiData);
  const filteredEmojis = getFilteredEmojis(filter, activeImageEmoji, serverEmojiData);

  const handlePress = useCallback(
    ({ type, code, name }) => {
      onAutocomplete(name);
    },
    [onAutocomplete],
  );

  if (filteredEmojis.length === 0) {
    return null;
  }

  return (
    <Popup>
      <FlatList
        keyboardShouldPersistTaps="always"
        initialNumToRender={12}
        data={filteredEmojis.slice(0, MAX_CHOICES)}
        keyExtractor={item => item.emoji_name}
        renderItem={({ item }) => (
          <EmojiRow
            type={item.emoji_type}
            code={item.emoji_code}
            name={item.emoji_name}
            onPress={handlePress}
          />
        )}
      />
    </Popup>
  );
}
