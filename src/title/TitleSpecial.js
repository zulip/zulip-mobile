/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { Label } from '../common';
import { Icon } from '../common/Icons';
import styles from '../styles';

const specials = {
  home: { name: 'All messages', icon: 'globe' },
  private: { name: 'Private messages', icon: 'mail' },
  starred: { name: 'Starred', icon: 'star' },
  mentioned: { name: 'Mentions', icon: 'at-sign' },
};

type Props = $ReadOnly<{|
  code: 'home' | 'private' | 'starred' | 'mentioned',
  color: string,
|}>;

export default class TitleSpecial extends PureComponent<Props> {
  render() {
    const { code, color } = this.props;
    const { name, icon } = specials[code];

    return (
      <View style={styles.navWrapper}>
        <Icon name={icon} size={20} color={color} style={styles.halfPaddingRight} />
        <Label style={[styles.navTitle, { color }]} text={name} />
      </View>
    );
  }
}
