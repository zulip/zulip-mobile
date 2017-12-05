/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow } from '../types';
import { Label } from '../common';
import Icon from '../common/Icons';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginLeft: 8,
  },
});

const specials = {
  home: { name: 'Home', icon: 'home' },
  private: { name: 'Private messages', icon: 'mail' },
  starred: { name: 'Starred', icon: 'star' },
  mentioned: { name: 'Mentions', icon: 'at-sign' },
};

type Props = {
  narrow: Narrow,
  color: string,
};

export default class TitleSpecial extends PureComponent<Props> {
  props: Props;

  render() {
    const { narrow, color } = this.props;
    const { name, icon } = specials[narrow[0].operand];

    return (
      <View style={styles.wrapper}>
        <Icon name={icon} size={18} color={color} />
        <Label style={[styles.title, { color }]} text={name} />
      </View>
    );
  }
}
