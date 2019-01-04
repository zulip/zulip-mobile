/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import languages from './languages';
import LanguagePickerItem from './LanguagePickerItem';

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

type Props = {|
  value: string,
  onValueChange: (locale: string) => void,
  filter: string,
|};

export default class LanguagePicker extends PureComponent<Props> {
  getFilteredLanguageList = (filter: string) => {
    const list = languages;

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
