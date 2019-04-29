/* @flow strict-local */

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import { getFilteredEmojiNames } from '../emoji/data';
import type { RealmEmojiById, InjectedDispatch } from '../types';
import { connect } from '../react-redux';
import { getActiveImageEmojiByName } from '../selectors';

type OwnProps = {|
  filter: string,
  onAutocomplete: (name: string) => void,
|};

type SelectorProps = {|
  activeImageEmojiByName: RealmEmojiById,
|};

type Props = {|
  ...InjectedDispatch,
  ...OwnProps,
  ...SelectorProps,
|};

const MAX_CHOICES = 30;

class EmojiAutocomplete extends PureComponent<Props> {
  onAutocomplete = (name: string): void => {
    this.props.onAutocomplete(name);
  };

  render() {
    const { filter, activeImageEmojiByName } = this.props;
    const emojiNames = getFilteredEmojiNames(filter, activeImageEmojiByName);

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

export default connect((state): SelectorProps => ({
  activeImageEmojiByName: getActiveImageEmojiByName(state),
}))(EmojiAutocomplete);
