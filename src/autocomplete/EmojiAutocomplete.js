/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import connectWithActions from '../connectWithActions';
import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import getFilteredEmojiList from '../emoji/getFilteredEmojiList';
import type { GlobalState, RealmEmojiState, ZulipExtraEmojisState } from '../types';
import { getActiveRealmEmoji, getAllZulipExtraEmoji } from '../selectors';
import zulipExtraEmojiMap from '../emoji/zulipExtraEmojiMap';

type Props = {
  filter: string,
  realmEmojiState: RealmEmojiState,
  zulipExtraEmojis: ZulipExtraEmojisState,
  onAutocomplete: (name: string) => void,
};

class EmojiAutocomplete extends PureComponent<Props> {
  props: Props;

  render() {
    const { filter, realmEmojiState, onAutocomplete, zulipExtraEmojis } = this.props;
    const emojis = getFilteredEmojiList(filter, realmEmojiState, zulipExtraEmojis);

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
              realmEmoji={
                realmEmojiState[
                  Object.keys(realmEmojiState).find(key => realmEmojiState[key].name === item)
                ]
              }
              zulipExtraEmoji={zulipExtraEmojis[item]}
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
  realmEmojiState: getActiveRealmEmoji(state),
  zulipExtraEmojis: getAllZulipExtraEmoji(zulipExtraEmojiMap)(state),
}))(EmojiAutocomplete);
