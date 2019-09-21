/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import Label from './Label';
import Touchable from './Touchable';
import { IconRight } from './Icons';
import type { SpecificIconType } from './Icons';
import type { ThemeColors } from '../styles';
import styles, { ThemeContext } from '../styles';

type Props = $ReadOnly<{|
  Icon?: SpecificIconType,
  label: string,
  onPress: () => void,
|}>;

export default class OptionButton extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeColors;

  styles = {
    icon: {
      ...styles.settingsIcon,
      color: this.context.color,
    },
  };

  render() {
    const { label, onPress, Icon } = this.props;

    return (
      <Touchable onPress={onPress}>
        <View style={styles.listItem}>
          {!!Icon && <Icon size={18} style={this.styles.icon} />}
          <Label text={label} />
          <View style={styles.rightItem}>
            <IconRight size={18} style={this.styles.icon} />
          </View>
        </View>
      </Touchable>
    );
  }
}
