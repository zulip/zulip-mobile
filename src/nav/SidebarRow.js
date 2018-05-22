/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context } from '../types';
import { Label, Touchable } from '../common';
import Icon from '../common/Icons';

type Props = {
  name: string,
  icon: string,
  onPress: () => void,
};

export default class SidebarRow extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { onPress, name, icon } = this.props;

    return (
      <Touchable onPress={onPress}>
        <View style={styles.item}>
          <Icon style={styles.icon} name={icon} />
          <Label text={name} />
        </View>
      </Touchable>
    );
  }
}
