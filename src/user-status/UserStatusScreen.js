/* @flow strict-local */
import React, { useContext, useState } from 'react';
import { FlatList, View } from 'react-native';
import { TranslationContext } from '../boot/TranslationProvider';
import { createStyleSheet } from '../styles';
import { Input, OptionButton, Screen, ZulipButton } from '../common';
import { getSelfUserStatusText } from '../selectors';
import { IconCancel, IconDone } from '../common/Icons';
import statusSuggestions from './userStatusTextSuggestions';
import { updateUserStatusText } from './userStatusActions';
import { useNavigation } from '../react-navigation';
import { useSelector, useDispatch } from '../react-redux';

const styles = createStyleSheet({
  statusTextInput: {
    margin: 16,
  },
  buttonsWrapper: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    margin: 8,
  },
});
export default function UserStatusScreen() {
  const _ = useContext(TranslationContext);
  const userStatusText = useSelector(state => getSelfUserStatusText(state));
  const [statusText, setStatusText] = useState(userStatusText);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const setStatusTextState = statusText => {
    setStatusText(statusText);
  };

  const updateStatusText = statusText => {
    dispatch(updateUserStatusText(statusText));
    navigation.goBack();
  };

  const handleStatusTextUpdate = () => {
    updateStatusText(statusText);
  };

  const handleStatusTextClear = () => {
    setStatusTextState('');
    updateStatusText('');
  };

  return (
    <Screen title="User status">
      <Input
        autoFocus
        maxLength={60}
        style={styles.statusTextInput}
        placeholder="What’s your status?"
        value={statusText}
        onChangeText={setStatusTextState}
      />
      <FlatList
        data={statusSuggestions}
        keyboardShouldPersistTaps="always"
        keyExtractor={item => item}
        renderItem={({ item, index }) => (
          <OptionButton
            key={item}
            label={item}
            onPress={() => {
              setStatusTextState(_(item));
            }}
          />
        )}
      />
      <View style={styles.buttonsWrapper}>
        <ZulipButton
          style={styles.button}
          secondary
          text="Clear"
          onPress={handleStatusTextClear}
          Icon={IconCancel}
        />
        <ZulipButton
          style={styles.button}
          text="Update"
          onPress={handleStatusTextUpdate}
          Icon={IconDone}
        />
      </View>
    </Screen>
  );
}
