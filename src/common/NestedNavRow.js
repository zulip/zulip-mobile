/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import Label from './Label';
import Touchable from './Touchable';
import { IconRight } from './Icons';
import type { SpecificIconType } from './Icons';
import type { ThemeData } from '../styles';
import styles, { ThemeContext } from '../styles';

type Props = $ReadOnly<{|
  Icon?: SpecificIconType,
  label: string,

  // Use this to navigate to a "nested" screen.
  onPress: () => void,
|}>;

/**
 * A button that navigates to a "nested" screen.
 *
 * Shows a right-facing arrow to indicate its purpose. If you need a
 * selectable option row instead, use `SelectableOptionRow`.
 */
export default class NestedNavRow extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    const { label, onPress, Icon } = this.props;

    return (
      <Touchable onPress={onPress}>
        <View style={styles.listItem}>
          {!!Icon && (
            <Icon size={24} style={[styles.settingsIcon, { color: this.context.color }]} />
          )}
          <Label text={label} />
          <View style={styles.rightItem}>
            <IconRight size={24} style={[styles.settingsIcon, { color: this.context.color }]} />
          </View>
        </View>
      </Touchable>
    );
  }
}
