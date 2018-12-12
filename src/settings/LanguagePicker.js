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

type Props = {
  value: string,
  onValueChange: (locale: string) => void,
};

export default class LanguagePicker extends PureComponent<Props> {
  render() {
    const { value, onValueChange } = this.props;

    return (
      <FlatList
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        initialNumToRender={languages.length}
        data={languages}
        keyExtractor={item => item.locale}
        renderItem={({ item }) => (
          <LanguagePickerItem
            selected={item.locale === value}
            onValueChange={onValueChange}
            {...item}
          />
        )}
      />
    );
  }
}
