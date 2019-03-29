/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { GetText } from '../types';
import { TranslationContext } from '../boot/TranslationProvider';
import { OptionButton } from '../common';
import statusSuggestions from './userStatusTextSuggestions';

type Props = {|
  onPress: (status: string) => void,
|};

export default class UserStatusPicker extends PureComponent<Props> {
  static contextType = TranslationContext;
  context: GetText;

  getTranslatedSuggestions = () =>
    statusSuggestions.map(suggestion => {
      const _ = this.context;
      return _(suggestion);
    });

  render() {
    const { onPress } = this.props;
    const data = this.getTranslatedSuggestions();

    return (
      <FlatList
        data={data}
        keyboardShouldPersistTaps="always"
        keyExtractor={item => item}
        renderItem={({ item, index }) => (
          <OptionButton
            key={item}
            label={item}
            onPress={() => onPress(item)}
          />
        )}
      />
    );
  }
}
