/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import { emojiReactionAdd } from '../api';
import { unicodeCodeByName } from './codePointMap';
import { Screen } from '../common';
import EmojiRow from './EmojiRow';
import { getFilteredEmojiNames } from './data';
import type { GlobalState, RealmEmojiState, Auth, Dispatch } from '../types';
import { getAuth, getActiveRealmEmojiByName } from '../selectors';
import { navigateBack } from '../nav/navActions';

type Props = {
  activeRealmEmojiByName: RealmEmojiState,
  auth: Auth,
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
  state = {
    filter: '',
  };

  handleInputChange = (text: string) => {
    this.setState({
      filter: text.toLowerCase(),
    });
  };

  addReaction = (emojiName: string) => {
    const { auth, dispatch, navigation, activeRealmEmojiByName } = this.props;
    const { messageId } = navigation.state.params;
    const realmEmoji = activeRealmEmojiByName[emojiName];
    const { reactionType, emojiCode } = realmEmoji
      ? { reactionType: 'realm_emoji', emojiCode: realmEmoji.id.toString() }
      : { reactionType: 'unicode_emoji', emojiCode: unicodeCodeByName[emojiName] };
    emojiReactionAdd(auth, messageId, reactionType, emojiCode, emojiName);
    dispatch(navigateBack());
  };

  render() {
    const { activeRealmEmojiByName } = this.props;
    const { filter } = this.state;

    const emojiNames = getFilteredEmojiNames(filter, activeRealmEmojiByName);

    return (
      <Screen search scrollEnabled={false} searchBarOnChange={this.handleInputChange}>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={20}
          data={emojiNames}
          keyExtractor={item => item}
          renderItem={({ item: name }) => <EmojiRow name={name} onPress={this.addReaction} />}
        />
      </Screen>
    );
  }
}

export default connect((state: GlobalState) => ({
  activeRealmEmojiByName: getActiveRealmEmojiByName(state),
  auth: getAuth(state),
}))(EmojiPickerScreen);
