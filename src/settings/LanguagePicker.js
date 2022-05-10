/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node, Context } from 'react';
import { FlatList } from 'react-native';

import type { GetText } from '../types';
import { TranslationContext } from '../boot/TranslationProvider';
import OptionDivider from '../common/OptionDivider';
import SelectableOptionRow from '../common/SelectableOptionRow';
import languages from './languages';
import type { Language } from './languages';

type Props = $ReadOnly<{|
  value: string,
  onValueChange: (tag: string) => void,
  filter: string,
|}>;

export default class LanguagePicker extends PureComponent<Props> {
  static contextType: Context<GetText> = TranslationContext;
  context: GetText;

  getTranslatedLanguages: () => $ReadOnlyArray<Language> = () =>
    languages.map((language: Language) => {
      const _ = this.context;
      const translatedName = _(language.name);
      return {
        ...language,
        name: translatedName,
      };
    });

  getFilteredLanguageList: string => $ReadOnlyArray<Language> = filter => {
    const list = this.getTranslatedLanguages();

    if (!filter) {
      return list;
    }

    return list.filter(item => {
      const itemData = `${item.name.toUpperCase()} ${item.selfname.toUpperCase()}`;
      const filterData = filter.toUpperCase();

      return itemData.includes(filterData);
    });
  };

  render(): Node {
    const { value, onValueChange, filter } = this.props;
    const data = this.getFilteredLanguageList(filter);

    return (
      <FlatList
        ItemSeparatorComponent={OptionDivider}
        initialNumToRender={languages.length}
        data={data}
        keyboardShouldPersistTaps="always"
        keyExtractor={item => item.tag}
        renderItem={({ item }) => (
          <SelectableOptionRow
            selected={item.tag === value}
            onRequestSelectionChange={onValueChange}
            itemKey={item.tag}
            subtitle={item.name}
            title={item.selfname}
          />
        )}
      />
    );
  }
}
