/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Context } from '../types';
import { RawLabel, Touchable } from '../common';
import { BRAND_COLOR } from '../styles';
import { IconDone } from '../common/Icons';

const componentStyles = StyleSheet.create({
  flag: {
    paddingRight: 8,
  },
  language: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
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
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { locale, flag, name, selected, onValueChange } = this.props;

    return (
      <Touchable onPress={() => onValueChange(locale)}>
        <View style={componentStyles.listItem}>
          <RawLabel style={componentStyles.flag} text={flag} />
          <RawLabel style={componentStyles.language} text={name} />
          {selected && <IconDone size={16} color={BRAND_COLOR} />}
        </View>
      </Touchable>
    );
  }
}
