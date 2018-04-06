/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { StyleObj } from '../types';
import { BRAND_COLOR, NAVBAR_SIZE } from '../styles';
import { ComponentWithOverlay, UnreadCount } from '../common';
import Icon from '../common/Icons';

const styles = StyleSheet.create({
  frame: {
    width: NAVBAR_SIZE,
    height: NAVBAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
    fontSize: 26,
  },
});

type Props = {
  color: string,
  style?: StyleObj,
  name?: string,
  unreadCount: number,
  onPress: () => any,
};

export default class NavButton extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    color: BRAND_COLOR,
    unreadCount: 0,
  };

  render() {
    const { name, style, color, unreadCount, onPress } = this.props;

    return (
      <ComponentWithOverlay
        style={styles.frame}
        showOverlay={unreadCount > 0}
        overlaySize={20}
        color="transparent"
        overlay={<UnreadCount count={unreadCount} />}
        onPress={onPress}
      >
        <Icon style={[styles.icon, style]} color={color} name={name} />
      </ComponentWithOverlay>
    );
  }
}
