/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import connectWithActions from '../connectWithActions';
import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import getFilteredEmojiList from '../emoji/getFilteredEmojiList';
import type { GlobalState, RealmEmojiType } from '../types';
import { getRealmEmoji } from '../selectors';

type Props = {
  filter: string,
  realmEmoji: RealmEmojiType,
  onAutocomplete: (name: string) => void,
};

class EmojiAutocomplete extends PureComponent<Props> {
  props: Props;

  render() {
    const { filter, realmEmoji, onAutocomplete } = this.props;
    const emojis = getFilteredEmojiList(filter, realmEmoji);

    if (emojis.length === 0) return null;

    return (
      <Popup>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={12}
          data={emojis}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <EmojiRow
              realmEmoji={realmEmoji[item]}
              name={item}
              onPress={() => onAutocomplete(item)}
            />
          )}
        />
      </Popup>
    );
  }
}

export default connectWithActions((state: GlobalState) => ({
  realmEmoji: getRealmEmoji(state),
}))(EmojiAutocomplete);
