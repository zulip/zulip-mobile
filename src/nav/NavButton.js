/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { StyleObj } from '../types';
import { BRAND_COLOR, CONTROL_SIZE } from '../styles';
import { ComponentWithOverlay, UnreadCount } from '../common';
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
});

type Props = {
  name?: string,
  color?: string,
  style?: StyleObj,
  unreadCount?: number,
  onPress?: () => void,
};

export default class NavButton extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
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
        <Icon style={[styles.icon, style]} color={color || BRAND_COLOR} name={name} />
      </ComponentWithOverlay>
    );
  }
}
