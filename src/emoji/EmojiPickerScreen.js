/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import { emojiReactionAdd } from '../api';
import { codePointMap } from './codePointMap';
import { Screen } from '../common';
import EmojiRow from './EmojiRow';
import getFilteredEmojiList from './getFilteredEmojiList';
import type { GlobalState, RealmEmojiState, Account, Dispatch } from '../types';
import { getActiveAccount, getActiveRealmEmojiById } from '../selectors';
import { navigateBack } from '../nav/navActions';

type Props = {
  realmEmoji: RealmEmojiState,
  auth: Account,
  dispatch: Dispatch,
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        messageId: number,
      },
    },
  },
};

type State = {
  filter: string,
};

class EmojiPickerScreen extends PureComponent<Props, State> {
  props: Props;
  state: State;

  state = {
    filter: '',
  };

  handleInputChange = (text: string) => {
    this.setState({
      filter: text.toLowerCase(),
    });
  };

  addReaction = (item: string) => {
    const { auth, dispatch, navigation } = this.props;
    const { messageId } = navigation.state.params;
    emojiReactionAdd(auth, messageId, 'unicode_emoji', codePointMap[item], item);
    dispatch(navigateBack());
  };

  render() {
    const { realmEmoji } = this.props;
    const { filter } = this.state;

    const emojis = getFilteredEmojiList(filter, realmEmoji);

    return (
      <Screen search scrollEnabled={false} searchBarOnChange={this.handleInputChange}>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={20}
          data={emojis}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <EmojiRow
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
  realmEmoji: getActiveRealmEmojiById(state),
  auth: getActiveAccount(state),
}))(EmojiPickerScreen);
