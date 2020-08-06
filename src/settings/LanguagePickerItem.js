/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { RawLabel, Touchable } from '../common';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { IconDone } from '../common/Icons';

const styles = createStyleSheet({
  languageWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  name: {
    fontWeight: '300',
    fontSize: 13,
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

type Props = $ReadOnly<{|
  locale: string,
  name: string,
  nativeName: string,
  selected: boolean,
  onValueChange: (locale: string) => void,
|}>;

export default class LanguagePickerItem extends PureComponent<Props> {
  render() {
    const { locale, name, nativeName, selected, onValueChange } = this.props;

    return (
      <Touchable onPress={() => onValueChange(locale)}>
        <View style={styles.listItem}>
          <View style={styles.languageWrapper}>
            <RawLabel text={nativeName} />
            <RawLabel text={name} style={styles.name} />
          </View>
          <View>{selected && <IconDone size={16} color={BRAND_COLOR} />}</View>
        </View>
      </Touchable>
    );
  }
}
