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
import type { GlobalState, RealmEmojiById, Auth, Dispatch } from '../types';
import { getAuth, getActiveImageEmojiByName } from '../selectors';
import { navigateBack } from '../nav/navActions';

type Props = {|
  activeImageEmojiByName: RealmEmojiById,
  auth: Auth,
  dispatch: Dispatch,
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        messageId: number,
      },
    },
  },
|};

type State = {|
  filter: string,
|};

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
    const { auth, dispatch, navigation, activeImageEmojiByName } = this.props;
    const { messageId } = navigation.state.params;
    const imageEmoji = activeImageEmojiByName[emojiName];
    const { reactionType, emojiCode } = imageEmoji
      ? { reactionType: 'realm_emoji', emojiCode: imageEmoji.code }
      : { reactionType: 'unicode_emoji', emojiCode: unicodeCodeByName[emojiName] };
    emojiReactionAdd(auth, messageId, reactionType, emojiCode, emojiName);
    dispatch(navigateBack());
  };

  render() {
    const { activeImageEmojiByName } = this.props;
    const { filter } = this.state;

    const emojiNames = getFilteredEmojiNames(filter, activeImageEmojiByName);

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
  activeImageEmojiByName: getActiveImageEmojiByName(state),
  auth: getAuth(state),
}))(EmojiPickerScreen);
