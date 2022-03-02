/* @flow strict-local */

import React, { useState, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import * as api from '../api';
import Screen from '../common/Screen';
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

export default function EmojiPickerScreen(props: Props): Node {
  const { route } = props;
  const { messageId } = route.params;

  const _ = useContext(TranslationContext);

  const activeImageEmojiByName = useSelector(getActiveImageEmojiByName);
  const auth = useSelector(getAuth);

  const [filter, setFilter] = useState<string>('');

  const handleInputChange = useCallback((text: string) => {
    setFilter(text.toLowerCase());
  }, []);

  const addReaction = useCallback(
    ({ type, code, name }) => {
      let reactionType: ReactionType | void = undefined;
      const imageEmoji = activeImageEmojiByName[name];
      if (imageEmoji) {
        reactionType = zulipExtraEmojiMap[name] ? 'zulip_extra_emoji' : 'realm_emoji';
      } else {
        reactionType = 'unicode_emoji';
      }

      api.emojiReactionAdd(auth, messageId, reactionType, code, name).catch(err => {
        logging.error('Error adding reaction emoji', err);
        showToast(_('Failed to add reaction'));
      });
      NavigationService.dispatch(navigateBack());
    },
    [activeImageEmojiByName, auth, messageId, _],
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
