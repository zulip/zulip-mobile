/* @flow strict-local */
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';
import React, { useState, useContext, useCallback } from 'react';
import type { Node } from 'react';
import { FlatList, View, Pressable } from 'react-native';

import { TranslationContext } from '../boot/TranslationProvider';
import { createStyleSheet, BRAND_COLOR, HIGHLIGHT_COLOR } from '../styles';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector } from '../react-redux';
import Input from '../common/Input';
import EmojiInput from './EmojiInput';
import type { Value as EmojiInputValue } from './EmojiInput';
import { unicodeCodeByName } from '../emoji/codePointMap';
import {
  emojiTypeFromReactionType,
  reactionTypeFromEmojiType,
  parseUnicodeEmojiCode,
} from '../emoji/data';
import SelectableOptionRow from '../common/SelectableOptionRow';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';
import { getZulipFeatureLevel, getAuth, getOwnUserId } from '../selectors';
import { getUserStatus } from './userStatusesModel';
import type { UserStatus } from '../api/modelTypes';
import { Icon } from '../common/Icons';
import * as api from '../api';

type StatusSuggestion = [
  $ReadOnly<{| emoji_name: string, emoji_code: string, reaction_type: 'unicode_emoji' |}>,
  string,
];

const statusSuggestions: $ReadOnlyArray<StatusSuggestion> = [
  ['calendar', 'In a meeting'],
  ['bus', 'Commuting'],
  ['sick', 'Out sick'],
  ['palm_tree', 'Vacationing'],
  ['house', 'Working remotely'],
].map(([emoji_name, status_text]) => [
  { emoji_name, emoji_code: unicodeCodeByName[emoji_name], reaction_type: 'unicode_emoji' },
  status_text,
]);

const styles = createStyleSheet({
  inputRow: {
    flexDirection: 'row',
    margin: 16,
  },
  statusTextInput: {
    flex: 1,
  },
  clearButton: {
    // Min touch-target size
    minWidth: 48,
    minHeight: 48,

    alignItems: 'center',
    justifyContent: 'center',

    // To match margin between the emoji and text inputs
    marginLeft: 4,
  },
  button: {
    margin: 8,
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'user-status'>,
  route: RouteProp<'user-status', void>,
|}>;

const statusTextFromInputValue = (v: string): $PropertyType<UserStatus, 'status_text'> =>
  v.trim() || null;

const inputValueFromStatusText = (t: $PropertyType<UserStatus, 'status_text'>): string => t ?? '';

const statusEmojiFromInputValue = (v: EmojiInputValue): $PropertyType<UserStatus, 'status_emoji'> =>
  v
    ? {
        emoji_name: v.name,
        emoji_code: v.code,
        reaction_type: reactionTypeFromEmojiType(v.type, v.name),
      }
    : null;

const inputValueFromStatusEmoji = (e: $PropertyType<UserStatus, 'status_emoji'>): EmojiInputValue =>
  e
    ? {
        type: emojiTypeFromReactionType(e.reaction_type),
        code: e.emoji_code,
        name: e.emoji_name,
      }
    : null;

export default function UserStatusScreen(props: Props): Node {
  const { navigation } = props;

  // TODO(server-5.0): Cut conditionals on emoji-status support (emoji
  //   supported as of FL 86: https://zulip.com/api/changelog )
  const serverSupportsEmojiStatus = useSelector(getZulipFeatureLevel) >= 86;

  const _ = useContext(TranslationContext);
  const auth = useSelector(getAuth);
  const ownUserId = useSelector(getOwnUserId);
  const userStatusText = useSelector(state => getUserStatus(state, ownUserId).status_text);
  const userStatusEmoji = useSelector(state => getUserStatus(state, ownUserId).status_emoji);

  const [textInputValue, setTextInputValue] = useState<string>(
    inputValueFromStatusText(userStatusText),
  );
  const [emojiInputValue, setEmojiInputValue] = useState<EmojiInputValue>(
    inputValueFromStatusEmoji(userStatusEmoji),
  );

  const sendToServer = useCallback(
    partialUserStatus => {
      const copy = { ...partialUserStatus };
      // TODO: Put conditional inside `api.updateUserStatus` itself; see
      //   https://github.com/zulip/zulip-mobile/issues/4659#issuecomment-914996061
      if (!serverSupportsEmojiStatus) {
        delete copy.status_emoji;
      }
      api.updateUserStatus(auth, copy);
      navigation.goBack();
    },
    [serverSupportsEmojiStatus, navigation, auth],
  );

  const handlePressSave = useCallback(() => {
    sendToServer({
      status_text: statusTextFromInputValue(textInputValue),
      status_emoji: statusEmojiFromInputValue(emojiInputValue),
    });
  }, [textInputValue, emojiInputValue, sendToServer]);

  const handlePressClear = useCallback(() => {
    setTextInputValue(inputValueFromStatusText(null));
    setEmojiInputValue(inputValueFromStatusEmoji(null));
  }, []);

  return (
    <Screen title="User status">
      <View style={styles.inputRow}>
        {serverSupportsEmojiStatus && (
          <EmojiInput
            navigation={navigation}
            value={emojiInputValue}
            onChangeValue={setEmojiInputValue}
            rightMargin
          />
        )}
        <Input
          autoFocus
          maxLength={60}
          style={styles.statusTextInput}
          placeholder="What’s your status?"
          value={textInputValue}
          onChangeText={setTextInputValue}
        />
        {(emojiInputValue !== null || textInputValue.length > 0) && (
          <Pressable style={styles.clearButton} onPress={handlePressClear}>
            {({ pressed }) => (
              <Icon name="x" size={24} color={pressed ? HIGHLIGHT_COLOR : BRAND_COLOR} />
            )}
          </Pressable>
        )}
      </View>
      <FlatList
        data={statusSuggestions}
        keyboardShouldPersistTaps="always"
        keyExtractor={(item, index) => index.toString() /* list is constant; index OK */}
        renderItem={({ item: [emoji, text], index }) => {
          const translatedText = _(text);
          return (
            <SelectableOptionRow
              itemKey={index}
              title={
                serverSupportsEmojiStatus
                  ? `${parseUnicodeEmojiCode(emoji.emoji_code)} ${translatedText}`
                  : translatedText
              }
              selected={
                translatedText === statusTextFromInputValue(textInputValue)
                && isEqual(emoji, statusEmojiFromInputValue(emojiInputValue))
              }
              onRequestSelectionChange={() => {
                setTextInputValue(translatedText);
                setEmojiInputValue(inputValueFromStatusEmoji(emoji));
              }}
            />
          );
        }}
      />
      <ZulipButton
        disabled={
          statusTextFromInputValue(textInputValue) === userStatusText
          && isEqual(statusEmojiFromInputValue(emojiInputValue), userStatusEmoji)
        }
        style={styles.button}
        text="Save"
        onPress={handlePressSave}
      />
    </Screen>
  );
}
