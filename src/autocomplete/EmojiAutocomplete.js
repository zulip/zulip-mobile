/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import connectWithActions from '../connectWithActions';
import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import getFilteredEmojiList from '../emoji/getFilteredEmojiList';
import type { GlobalState, RealmEmojiState } from '../types';
import { getActiveRealmEmoji } from '../selectors';

type Props = {
  filter: string,
  realmEmojiState: RealmEmojiState,
  onAutocomplete: (name: string) => void,
};

class EmojiAutocomplete extends PureComponent<Props> {
  props: Props;

  render() {
    const { filter, realmEmojiState, onAutocomplete } = this.props;
    const emojis = getFilteredEmojiList(filter, realmEmojiState);

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
}))(EmojiAutocomplete);
