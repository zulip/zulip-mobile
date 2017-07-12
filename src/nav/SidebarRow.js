/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { Label, Touchable } from '../common';
import Icon from '../common/Icons';

export default class SidebarRow extends PureComponent {
  props: {
    name: string,
    icon: string,
    onPress: () => void,
  };

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
