/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import { getFilteredEmojiNames } from '../emoji/data';
import type { GlobalState, RealmEmojiState } from '../types';
import { getActiveRealmEmojiByName } from '../selectors';

type Props = {
  filter: string,
  activeRealmEmojiByName: RealmEmojiState,
  onAutocomplete: (name: string) => void,
};

const MAX_CHOICES = 30;

class EmojiAutocomplete extends PureComponent<Props> {
  onAutocomplete = (name: string): void => {
    this.props.onAutocomplete(name);
  };

  render() {
    const { filter, activeRealmEmojiByName } = this.props;
    const emojiNames = getFilteredEmojiNames(filter, activeRealmEmojiByName);

    if (emojiNames.length === 0) {
      return null;
    }

    return (
      <Popup>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={12}
          data={emojiNames.slice(0, MAX_CHOICES)}
          keyExtractor={item => item}
          renderItem={({ item: name }) => <EmojiRow name={name} onPress={this.onAutocomplete} />}
        />
      </Popup>
    );
  }
}

export default connect((state: GlobalState) => ({
  activeRealmEmojiByName: getActiveRealmEmojiByName(state),
}))(EmojiAutocomplete);
