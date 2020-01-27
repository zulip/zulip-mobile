/* @flow strict-local */

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';

import * as api from '../api';
import { unicodeCodeByName } from './codePointMap';
import { Screen } from '../common';
import EmojiRow from './EmojiRow';
import { getFilteredEmojis } from './data';
import type { RealmEmojiById, Auth, Dispatch, ReactionType } from '../types';
import { connect } from '../react-redux';
import { getAuth, getActiveImageEmojiByName } from '../selectors';
import { navigateBack } from '../nav/navActions';
import zulipExtraEmojiMap from './zulipExtraEmojiMap';

type Props = $ReadOnly<{|
  activeImageEmojiByName: RealmEmojiById,
  auth: Auth,
  dispatch: Dispatch,
  navigation: NavigationScreenProp<{ params: {| messageId: number |} }>,
|}>;

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

  getReactionTypeAndCode = (
    emojiName: string,
  ): { reactionType: ReactionType, emojiCode: string } => {
    const { activeImageEmojiByName } = this.props;
    const imageEmoji = activeImageEmojiByName[emojiName];
    if (imageEmoji) {
      return {
        reactionType: zulipExtraEmojiMap[emojiName] ? 'zulip_extra_emoji' : 'realm_emoji',
        emojiCode: imageEmoji.code,
      };
    }
    return { reactionType: 'unicode_emoji', emojiCode: unicodeCodeByName[emojiName] };
  };

  addReaction = (emojiName: string) => {
    const { auth, dispatch, navigation } = this.props;
    const { messageId } = navigation.state.params;

    const { reactionType, emojiCode } = this.getReactionTypeAndCode(emojiName);
    api.emojiReactionAdd(auth, messageId, reactionType, emojiCode, emojiName);
    dispatch(navigateBack());
  };

  render() {
    const { activeImageEmojiByName } = this.props;
    const { filter } = this.state;

    const emojiNames = getFilteredEmojis(filter, activeImageEmojiByName);

    return (
      <Screen search scrollEnabled={false} searchBarOnChange={this.handleInputChange}>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={20}
          data={emojiNames}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <EmojiRow
              type={item.emoji_type}
              code={item.code}
              name={item.name}
              onPress={this.addReaction}
            />
          )}
        />
      </Screen>
    );
  }
}

export default connect(state => ({
  activeImageEmojiByName: getActiveImageEmojiByName(state),
  auth: getAuth(state),
}))(EmojiPickerScreen);
