/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context } from '../types';
import { RawLabel, Touchable } from '../common';
import { BRAND_COLOR } from '../styles';
import { IconDone } from '../common/Icons';

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
    const { styles } = this.context;
    const { locale, flag, name, selected, onValueChange } = this.props;

    return (
      <Touchable onPress={() => onValueChange(locale)}>
        <View style={styles.listItem}>
          <RawLabel style={styles.halfPaddingRight} text={flag} />
          <RawLabel style={styles.flexed} text={name} />
          {selected && <IconDone size={24} color={BRAND_COLOR} />}
        </View>
      </Touchable>
    );
  }
}
