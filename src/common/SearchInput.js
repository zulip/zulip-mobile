/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import type { EditingEvent } from 'react-native/Libraries/Components/TextInput/TextInput';
import { View } from 'react-native';
import InputWithClearButton from './InputWithClearButton';
import { createStyleSheet } from '../styles';

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 0,
    minHeight: 50,
  },
});

type Props = $ReadOnly<{|
  autoFocus?: boolean,
  onChangeText: (text: string) => void,
  onSubmitEditing: (e: EditingEvent) => mixed,
|}>;

/**
 * A light abstraction over the standard TextInput component
 * that configures and styles it to be a used as a search input.
 *
 * @prop [autoFocus] - should the component be focused when mounted.
 * @prop onChangeText - Event called when search query is edited.
 */
export default function SearchInput(props: Props): Node {
  const { autoFocus = true, onChangeText, onSubmitEditing } = props;

  return (
    <View style={styles.wrapper}>
      <InputWithClearButton
        style={styles.input}
        autoCorrect={false}
        enablesReturnKeyAutomatically
        selectTextOnFocus
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        placeholder="Search"
        returnKeyType="search"
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}
