/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { Label, Touchable } from '../common';
import { IconRight } from '../common/Icons';

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
        <View style={styles.optionRow}>
          {Icon && <Icon size={18} style={[styles.icon, styles.settingsIcon]} />}
          <Label style={styles.optionTitle} text={label} />
          <View style={styles.rightItem}>
            <IconRight size={18} style={[styles.icon, styles.settingsIcon]} />
          </View>
        </View>
      </Touchable>
    );
  }
}
