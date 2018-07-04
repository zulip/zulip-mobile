/* @flow */
import { connect } from 'react-redux';

import React, { Component } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput } from 'react-native';

import { emojiReactionAdd } from '../api';
import { Screen } from '../common';
import EmojiRow from './EmojiRow';
import getFilteredEmojiList from './getFilteredEmojiList';
import type { GlobalState, RealmEmojiState } from '../types';
import { getActiveRealmEmoji } from '../selectors';

const componentStyles = StyleSheet.create({
  listWrapper: {
    flex: 1,
    height: 200,
  },
});

type Props = {
  realmEmoji: RealmEmojiState,
};

type State = {
  filer: string,
};

class EmojiPicker extends Component<Props, State> {
  state = {
    filter: '',
  };

  handleInputChange = text => {
    this.setState({
      filter: text.toLowerCase(),
    });
  };

  addReaction = item => {
    console.log(item + this.props.realmEmoji[item]);
    const auth = {
      realm: 'https://fossboys.zulipchat.com',
      email: 'aswinganesh666@gmail.com',
      apiKey: 'P2dmXl1bhhD9Smt9F4iTJaA4lgrUJDOV',
    };
    // emojiReactionAdd(props.auth, messageId, reactionType, code, name);
    emojiReactionAdd(auth, 128913712, 'unicode_emoji', '1f602', 'joy');
  };

  render() {
    const { realmEmoji } = this.props;
    const { filter } = this.state;

    const emojis = getFilteredEmojiList(filter, realmEmoji);

    return (
      <Screen title="Add Reaction">
        <Text>TESTING</Text>
        <TextInput
          onChangeText={text => this.handleInputChange(text)}
          placeholder="Search for emoji"
        />
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={20}
          data={emojis}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <EmojiRow
              realmEmoji={realmEmoji[item]}
              name={item}
              onPress={() => {
                this.addReaction(item);
              }}
            />
          )}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  realmEmoji: getActiveRealmEmoji(state),
}))(EmojiPicker);
