/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import type { GetText } from '../types';
import { TranslationContext } from '../boot/TranslationProvider';

import languages from './languages';
import type { Language } from './languages';
import LanguagePickerItem from './LanguagePickerItem';

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'hsla(0, 0%, 0%, 0.1)',
  },
});

type Props = {|
  value: string,
  onValueChange: (locale: string) => void,
  filter: string,
|};

export default class LanguagePicker extends PureComponent<Props> {
  static contextType = TranslationContext;
  context: GetText;

  getTranslatedLanguages = (): Language[] =>
    languages.map((language: Language) => {
      const _ = this.context;
      const translatedName = _(language.name);
      return {
        ...language,
        name: translatedName,
      };
    });

  getFilteredLanguageList = (filter: string): Language[] => {
    const list = this.getTranslatedLanguages();

    if (!filter) {
      return list;
    }

    return list.filter(item => {
      const itemData = `${item.name.toUpperCase()} ${item.nativeName.toUpperCase()}`;
      const filterData = filter.toUpperCase();

      return itemData.includes(filterData);
    });
  };

  render() {
    const { value, onValueChange, filter } = this.props;
    const data = this.getFilteredLanguageList(filter);

    return (
      <FlatList
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        initialNumToRender={languages.length}
        data={data}
        keyboardShouldPersistTaps="always"
        keyExtractor={item => item.locale}
        renderItem={({ item }) => (
          <LanguagePickerItem
            selected={item.locale === value}
            onValueChange={onValueChange}
            locale={item.locale}
            name={item.name}
            nativeName={item.nativeName}
          />
        )}
      />
    );
  }
}
