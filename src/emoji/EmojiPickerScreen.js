/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import { FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import * as api from '../api';
import { unicodeCodeByName } from './codePointMap';
import { Screen } from '../common';
import EmojiRow from './EmojiRow';
import { getFilteredEmojis } from './data';
import type { ReactionType } from '../types';
import { useSelector } from '../react-redux';
import { getAuth, getActiveImageEmojiByName } from '../selectors';
import { navigateBack } from '../nav/navActions';
import zulipExtraEmojiMap from './zulipExtraEmojiMap';
import * as logging from '../utils/logging';
import { showToast } from '../utils/info';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'emoji-picker'>,
  route: RouteProp<'emoji-picker', {| messageId: number |}>,
|}>;

export default function EmojiPickerScreen(props: Props) {
  const { route } = props;
  const { messageId } = route.params;

  const activeImageEmojiByName = useSelector(getActiveImageEmojiByName);
  const auth = useSelector(getAuth);

  const [filter, setFilter] = useState<string>('');

  const handleInputChange = useCallback((text: string) => {
    setFilter(text.toLowerCase());
  }, []);

  const getReactionTypeAndCode = useCallback(
    (
      emojiName: string,
    ): {|
      reactionType: ReactionType,
      emojiCode: string,
    |} => {
      const imageEmoji = activeImageEmojiByName[emojiName];
      if (imageEmoji) {
        return {
          reactionType: zulipExtraEmojiMap[emojiName] ? 'zulip_extra_emoji' : 'realm_emoji',
          emojiCode: imageEmoji.code,
        };
      }
      return { reactionType: 'unicode_emoji', emojiCode: unicodeCodeByName[emojiName] };
    },
    [activeImageEmojiByName],
  );

  const addReaction = useCallback(
    (emojiName: string) => {
      const { reactionType, emojiCode } = getReactionTypeAndCode(emojiName);
      api.emojiReactionAdd(auth, messageId, reactionType, emojiCode, emojiName).catch(err => {
        logging.error('Error adding reaction emoji', err);
        showToast(`${err}`);
      });
      NavigationService.dispatch(navigateBack());
    },
    [auth, messageId, getReactionTypeAndCode],
  );

  const emojiNames = getFilteredEmojis(filter, activeImageEmojiByName);

  return (
    <Screen search autoFocus scrollEnabled={false} searchBarOnChange={handleInputChange}>
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
            onPress={addReaction}
          />
        )}
      />
    </Screen>
  );
}
