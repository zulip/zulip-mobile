/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';
import { BRAND_COLOR, CONTROL_SIZE } from '../styles';
import { Touchable, UnreadCount } from '../common';
import Icon from '../common/Icons';

const styles = StyleSheet.create({
  frame: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
    fontSize: 26,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    right: 6,
    top: 6,
    position: 'absolute',
  },
  unreadCount: {
    top: 2,
    right: 2,
    position: 'absolute',
  },
});

export default class NavButton extends PureComponent {
  props: {
    name: string,
    color?: ?string,
    showCircle: boolean,
    unreadCount: number,
    style?: StyleObj,
    onPress: () => void,
  };

  static defaultProps = {
    showCircle: false,
    unreadCount: 0,
  };

  render() {
    const { name, style, color, showCircle, unreadCount, onPress } = this.props;

    return (
      <Touchable onPress={onPress}>
        <View style={styles.frame}>
          <Icon style={[styles.icon, style]} color={color || BRAND_COLOR} name={name} />
          {showCircle && <View style={[styles.circle, { backgroundColor: color }]} />}
          {unreadCount > 0 && <UnreadCount count={unreadCount} style={styles.unreadCount} />}
        </View>
      </Touchable>
    );
  }
}
