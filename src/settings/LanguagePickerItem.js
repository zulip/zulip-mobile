/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { RawLabel, Touchable } from '../common';
import { BRAND_COLOR } from '../styles';
import { IconDone } from '../common/Icons';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    height: 44,
    padding: 8,
    alignItems: 'center',
  },
  flag: {
    paddingRight: 8,
  },
  language: {
    flex: 1,
  },
});

export default class LanguagePickerItem extends React.Component {
  props: {
    locale: string,
    flag: string,
    name: string,
    selected: boolean,
    onValueChange: () => void,
  };

  render() {
    const { locale, flag, name, selected, onValueChange } = this.props;

    return (
      <Touchable onPress={() => onValueChange(locale)}>
        <View style={styles.row}>
          <RawLabel style={styles.flag} text={flag} />
          <RawLabel style={styles.language} text={name} />
          {selected && <IconDone style={styles.icon} size={24} color={BRAND_COLOR} />}
        </View>
      </Touchable>
    );
  }
}
