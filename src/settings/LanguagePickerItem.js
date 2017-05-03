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
    justifyContent: 'center',
  },
  language: {
    flex: 1,
    height: 44,
  }
});

export default class LanguagePicker extends React.Component {

  props: {
    selected: boolean,
    onValueChange: () => {}
  };

  render() {
    const { locale, flag, name, selected, onValueChange } = this.props;

    return (
      <Touchable onPress={() => onValueChange(locale)}>
        <View style={styles.row}>
          <RawLabel text={flag} />
          <RawLabel style={styles.language} text={name} />
          {selected &&
            <IconDone
              style={styles.icon}
              size={24}
              color={BRAND_COLOR}
            />
          }
        </View>
      </Touchable>
    );
  }
}
