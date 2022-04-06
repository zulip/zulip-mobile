/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { FlatList, LogBox } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import EmojiRow from './EmojiRow';
import { getFilteredEmojis } from './data';
import { getActiveImageEmojiByName } from '../selectors';
import type { EmojiType } from '../types';
import { useSelector } from '../react-redux';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'emoji-picker'>,
  route: RouteProp<
    'emoji-picker',
    {|
      // This param is a function, so React Nav is right to point out that
      // it isn't serializable. But this is fine as long as we don't try to
      // persist navigation state for this screen or set up deep linking to
      // it, hence the LogBox suppression below.
      //
      // React Navigation doesn't offer a more sensible way to do have us
      // pass the emoji data to the calling screen. …We could store the
      // emoji data as a route param on the calling screen, or in Redux. But
      // from this screen's perspective, that's basically just setting a
      // global variable. Better to offer this explicit, side-effect-free
      // way for the data to flow where it should, when it should.
      onPressEmoji: ({| +type: EmojiType, +code: string, +name: string |}) => void,
    |},
  >,
|}>;

// React Navigation would give us a console warning about non-serializable
// route params. For more about the warning, see
//   https://reactnavigation.org/docs/5.x/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
// See comment on this param, above.
LogBox.ignoreLogs([/emoji-picker > params\.onPressEmoji \(Function\)/]);

export default function EmojiPickerScreen(props: Props): Node {
  const { navigation, route } = props;
  const { onPressEmoji } = route.params;

  const activeImageEmojiByName = useSelector(getActiveImageEmojiByName);

  const [filter, setFilter] = useState<string>('');

  const handleInputChange = useCallback((text: string) => {
    setFilter(text.toLowerCase());
  }, []);

  const handlePressEmoji = useCallback(
    (...args) => {
      onPressEmoji(...args);
      navigation.goBack();
    },
    [onPressEmoji, navigation],
  );

  const emojiNames = getFilteredEmojis(filter, activeImageEmojiByName);

  return (
    <Screen search autoFocus scrollEnabled={false} searchBarOnChange={handleInputChange}>
      <FlatList
        keyboardShouldPersistTaps="always"
        initialNumToRender={20}
        data={emojiNames}
        keyExtractor={item => item.emoji_name}
        renderItem={({ item }) => (
          <EmojiRow
            type={item.emoji_type}
            code={item.emoji_code}
            name={item.emoji_name}
            onPress={handlePressEmoji}
          />
        )}
      />
    </Screen>
  );
}
