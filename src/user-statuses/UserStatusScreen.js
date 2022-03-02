/* @flow strict-local */
import React, { useState, useContext, useCallback } from 'react';
import type { Node } from 'react';
import { FlatList, View } from 'react-native';
import { TranslationContext } from '../boot/TranslationProvider';
import { createStyleSheet } from '../styles';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector } from '../react-redux';
import Input from '../common/Input';
import EmojiInput from './EmojiInput';
import type { Value as EmojiInputValue } from './EmojiInput';
import { emojiTypeFromReactionType, reactionTypeFromEmojiType } from '../emoji/data';
import SelectableOptionRow from '../common/SelectableOptionRow';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';
import { getZulipFeatureLevel, getAuth, getOwnUserId } from '../selectors';
import { getUserStatus } from './userStatusesModel';
import type { UserStatus } from '../api/modelTypes';
import { IconCancel, IconDone } from '../common/Icons';
import statusSuggestions from './userStatusTextSuggestions';
import * as api from '../api';

const styles = createStyleSheet({
  inputRow: {
    flexDirection: 'row',
    margin: 16,
  },
  statusTextInput: {
    flex: 1,
  },
  buttonsWrapper: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
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

  const handlePressUpdate = useCallback(() => {
    sendToServer({
      status_text: statusTextFromInputValue(textInputValue),
      status_emoji: statusEmojiFromInputValue(emojiInputValue),
    });
  }, [textInputValue, emojiInputValue, sendToServer]);

  const handlePressClear = useCallback(() => {
    setTextInputValue(inputValueFromStatusText(null));
    setEmojiInputValue(inputValueFromStatusEmoji(null));
    sendToServer({ status_text: null, status_emoji: null });
  }, [sendToServer]);

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
      </View>
      <FlatList
        data={statusSuggestions}
        keyboardShouldPersistTaps="always"
        keyExtractor={item => item}
        renderItem={({ item: text, index }) => {
          const translatedText = _(text);
          return (
            <SelectableOptionRow
              itemKey={text}
              title={translatedText}
              selected={translatedText === statusTextFromInputValue(textInputValue)}
              onRequestSelectionChange={() => {
                setTextInputValue(translatedText);
              }}
            />
          );
        }}
      />
      <View style={styles.buttonsWrapper}>
        <ZulipButton
          style={styles.button}
          secondary
          text="Clear"
          onPress={handlePressClear}
          Icon={IconCancel}
        />
        <ZulipButton
          style={styles.button}
          text="Update"
          onPress={handlePressUpdate}
          Icon={IconDone}
        />
      </View>
    </Screen>
  );
}
