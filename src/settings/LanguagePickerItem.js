/* @flow */
import React, { PureComponent } from 'react';
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

type Props = {
  locale: string,
  flag: string,
  name: string,
  selected: boolean,
  onValueChange: (locale: string) => void,
};

export default class LanguagePickerItem extends PureComponent<Props> {
  props: Props;

  render() {
    const { locale, flag, name, selected, onValueChange } = this.props;

    return (
      <Touchable onPress={() => onValueChange(locale)}>
        <View style={styles.row}>
          <RawLabel style={styles.flag} text={flag} />
          <RawLabel style={styles.language} text={name} />
          {selected && <IconDone size={24} color={BRAND_COLOR} />}
        </View>
      </Touchable>
    );
  }
}
