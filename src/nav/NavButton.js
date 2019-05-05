/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { BRAND_COLOR, NAVBAR_SIZE } from '../styles';
import ComponentWithOverlay from '../common/ComponentWithOverlay';
import UnreadCount from '../common/UnreadCount';
import { Icon } from '../common/Icons';

type Props = {|
  color: string,
  style?: TextStyleProp,
  name: string,
  unreadCount: number,
  onPress: () => void,
|};

export default class NavButton extends PureComponent<Props> {
  static defaultProps = {
    color: BRAND_COLOR,
    unreadCount: 0,
  };

  styles = StyleSheet.create({
    navButtonFrame: {
      width: NAVBAR_SIZE,
      height: NAVBAR_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navButtonIcon: {
      textAlign: 'center',
      fontSize: 26,
    },
  });

  render() {
    const { name, style, color, unreadCount, onPress } = this.props;

    return (
      <ComponentWithOverlay
        style={this.styles.navButtonFrame}
        showOverlay={unreadCount > 0}
        overlaySize={20}
        overlay={<UnreadCount count={unreadCount} />}
        onPress={onPress}
      >
        <Icon style={[this.styles.navButtonIcon, style]} color={color} name={name} />
      </ComponentWithOverlay>
    );
  }
}
