/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import { Popup } from '../common';
import EmojiRow from '../emoji/EmojiRow';
import { getFilteredEmojiNames } from '../emoji/data';
import type { EmojiNameToCodePoint, GlobalState, RealmEmojiState } from '../types';
import { getActiveRealmEmojiByName, getCodePointMap } from '../selectors';

type Props = {|
  codePointMap: EmojiNameToCodePoint,
  filter: string,
  activeRealmEmojiByName: RealmEmojiState,
  onAutocomplete: (name: string) => void,
|};

const MAX_CHOICES = 30;

class EmojiAutocomplete extends PureComponent<Props> {
  onAutocomplete = (name: string): void => {
    this.props.onAutocomplete(name);
  };

  render() {
    const { codePointMap, filter, activeRealmEmojiByName } = this.props;
    const emojiNames = getFilteredEmojiNames(filter, activeRealmEmojiByName, codePointMap);

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
          renderItem={({ item: name }) => (
            <EmojiRow codePointMap={codePointMap} name={name} onPress={this.onAutocomplete} />
          )}
        />
      </Popup>
    );
  }
}

export default connect((state: GlobalState) => ({
  activeRealmEmojiByName: getActiveRealmEmojiByName(state),
  codePointMap: getCodePointMap(state),
}))(EmojiAutocomplete);
