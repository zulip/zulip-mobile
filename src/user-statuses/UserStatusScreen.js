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
import SelectableOptionRow from '../common/SelectableOptionRow';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';
import { getAuth, getOwnUserId } from '../selectors';
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

export default function UserStatusScreen(props: Props): Node {
  const { navigation } = props;

  const _ = useContext(TranslationContext);
  const auth = useSelector(getAuth);
  const ownUserId = useSelector(getOwnUserId);
  const userStatusText = useSelector(state => getUserStatus(state, ownUserId).status_text);

  const [textInputValue, setTextInputValue] = useState<string>(
    inputValueFromStatusText(userStatusText),
  );

  const sendToServer = useCallback(
    partialUserStatus => {
      api.updateUserStatus(auth, partialUserStatus);
      navigation.goBack();
    },
    [navigation, auth],
  );

  const handlePressUpdate = useCallback(() => {
    sendToServer({ status_text: statusTextFromInputValue(textInputValue) });
  }, [textInputValue, sendToServer]);

  const handlePressClear = useCallback(() => {
    setTextInputValue(inputValueFromStatusText(null));
    sendToServer({ status_text: null });
  }, [sendToServer]);

  return (
    <Screen title="User status">
      <View style={styles.inputRow}>
        {
          // TODO: Input for emoji status
        }
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
