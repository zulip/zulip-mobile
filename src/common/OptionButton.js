/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label, Touchable } from '../common';
import { IconRight } from '../common/Icons';

const style = StyleSheet.create({
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
  },
  optionTitle: {
    padding: 8,
    paddingLeft: 0,
  },
});

type Props = {
  Icon?: Object,
  label: string,
  onPress: () => void,
};

export default class OptionButton extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  render() {
    const { label, onPress, Icon } = this.props;
    const { styles } = this.context;

    return (
      <Touchable onPress={onPress}>
        <View style={style.optionRow}>
          {Icon && <Icon size={18} style={[styles.icon, styles.settingsIcon]} />}
          <Label style={style.optionTitle} text={label} />
          <View style={styles.rightItem}>
            <IconRight size={18} style={[styles.icon, styles.settingsIcon]} />
          </View>
        </View>
      </Touchable>
    );
  }
}
