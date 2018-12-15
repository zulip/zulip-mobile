/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context, Narrow } from '../types';
import { Label } from '../common';
import Icon from '../common/Icons';

const specials = {
  home: { name: 'All messages', icon: 'home' },
  private: { name: 'Private messages', icon: 'mail' },
  starred: { name: 'Starred', icon: 'star' },
  mentioned: { name: 'Mentions', icon: 'at-sign' },
};

type Props = {|
  narrow: Narrow,
  color: string,
|};

export default class TitleSpecial extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { narrow, color } = this.props;
    const { name, icon } = specials[narrow[0].operand];

    return (
      <View style={styles.navWrapper}>
        <Icon name={icon} size={20} color={color} style={styles.halfPaddingRight} />
        <Label style={[styles.navTitle, { color }]} text={name} />
      </View>
    );
  }
}
