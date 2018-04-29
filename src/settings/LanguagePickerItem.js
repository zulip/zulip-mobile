/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

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

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { locale, flag, name, selected, onValueChange } = this.props;

    return (
      <Touchable onPress={() => onValueChange(locale)}>
        <View style={styles.listItem}>
          <RawLabel style={componentStyles.flag} text={flag} />
          <RawLabel style={componentStyles.language} text={name} />
          {selected && <IconDone size={24} color={BRAND_COLOR} />}
        </View>
      </Touchable>
    );
  }
}
