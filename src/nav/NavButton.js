/* @flow */
import React, { PureComponent } from 'react';

import type { Style } from '../types';
import { BRAND_COLOR } from '../styles';
import { ComponentWithOverlay, UnreadCount } from '../common';
import Icon from '../common/Icons';

type Props = {
  color: string,
  style?: Style,
  name?: string,
  unreadCount: number,
  onPress: () => any,
};

export default class NavButton extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    color: BRAND_COLOR,
    unreadCount: 0,
  };

  render() {
    const { styles } = this.context;
    const { name, style, color, unreadCount, onPress } = this.props;

    return (
      <ComponentWithOverlay
        style={styles.navButtonFrame}
        showOverlay={unreadCount > 0}
        overlaySize={20}
        color="transparent"
        overlay={<UnreadCount count={unreadCount} />}
        onPress={onPress}
      >
        <Icon style={[styles.navButtonIcon, style]} color={color} name={name} />
      </ComponentWithOverlay>
    );
  }
}
