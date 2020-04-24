/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { GetText } from '../types';
import { TranslationContext } from '../boot/TranslationProvider';
import { OptionDivider } from '../common';
import { type Language, languageData } from '../i18n/language_list';
import LanguagePickerItem from './LanguagePickerItem';

type Props = $ReadOnly<{|
  value: string,
  onValueChange: (locale: string) => void,
  filter: string,
|}>;

const sortForDisplay = (arr: $ReadOnlyArray<Language>): $ReadOnlyArray<Language> =>
  [...arr].sort((a, b) =>
    a.locale === 'en' ? -1 : b.locale === 'en' ? +1 : a.name < b.name ? -1 : +1,
  );

const languages: $ReadOnlyArray<Language> = sortForDisplay(languageData);

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
        ItemSeparatorComponent={OptionDivider}
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
